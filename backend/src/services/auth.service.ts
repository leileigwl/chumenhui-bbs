import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import type { User } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { tokenBlacklist } from '../lib/redis.js'
import { sendPasswordResetEmail } from '../lib/mailer.js'
import type { JwtPayload } from '../plugins/jwt.js'

// ─── helpers ──────────────────────────────────────────────────────────────────

type FastifyJwtSign = (
  payload: JwtPayload,
  options?: { expiresIn: string | number },
) => string

// Injected at startup so the service does not depend on a Fastify instance directly
let _jwtSign: FastifyJwtSign | null = null

export function setJwtSign(fn: FastifyJwtSign): void {
  _jwtSign = fn
}

function signToken(payload: JwtPayload, expiresIn: string): string {
  if (!_jwtSign) throw new Error('JWT sign function not initialised')
  return _jwtSign(payload, { expiresIn })
}

const ACCESS_TTL = process.env['JWT_EXPIRES_IN'] ?? '15m'
const REFRESH_TTL = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d'

/** Parse duration strings like "15m", "7d" into milliseconds. */
function parseDurationMs(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/)
  if (!match) return 15 * 60 * 1000
  const [, n, unit] = match as [string, string, string]
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }
  return parseInt(n, 10) * (multipliers[unit] ?? 60 * 1000)
}

function makeAccessToken(user: User): string {
  return signToken(
    { userId: user.id, email: user.email, role: user.role, type: 'access' },
    ACCESS_TTL,
  )
}

function makeRefreshToken(user: User): string {
  return signToken(
    { userId: user.id, email: user.email, role: user.role, type: 'refresh' },
    REFRESH_TTL,
  )
}

// ─── public API ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/**
 * Register a new user.
 * Throws a typed error object on conflict.
 */
export async function register(
  email: string,
  password: string,
  username: string,
  nickname?: string,
): Promise<User> {
  const [byEmail, byUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ])

  if (byEmail) {
    const err = new Error('邮箱已被注册') as Error & { code: string }
    err.code = 'AUTH_EMAIL_EXISTS'
    throw err
  }
  if (byUsername) {
    const err = new Error('用户名已被占用') as Error & { code: string }
    err.code = 'AUTH_USERNAME_EXISTS'
    throw err
  }

  const hashed = await bcrypt.hash(password, 12)

  return prisma.user.create({
    data: {
      email,
      password: hashed,
      username,
      nickname: nickname ?? username,
    },
  })
}

/**
 * Authenticate a user and return tokens.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('邮箱或密码错误') as Error & { code: string }
    err.code = 'AUTH_INVALID_CREDENTIALS'
    throw err
  }

  if (user.isBanned) {
    const err = new Error('账号已被封禁') as Error & { code: string }
    err.code = 'AUTH_USER_BANNED'
    throw err
  }

  return {
    user,
    accessToken: makeAccessToken(user),
    refreshToken: makeRefreshToken(user),
  }
}

/**
 * Exchange a valid refresh token for a new access token.
 */
export async function refreshToken(
  token: string,
): Promise<{ accessToken: string }> {
  if (!_jwtSign) throw new Error('JWT sign function not initialised')

  // Verify the token directly via the Fastify JWT instance stored externally
  // We decode manually to avoid a circular dependency on the Fastify instance.
  // The caller (route handler) should pre-verify and pass the decoded payload.
  throw new Error(
    'Use refreshTokenFromPayload — the route should decode the token first',
  )
}

/**
 * Called by the route after jwtVerify() to issue a new access token.
 */
export async function refreshTokenFromPayload(payload: JwtPayload): Promise<{ accessToken: string }> {
  if (payload.type !== 'refresh') {
    const err = new Error('无效的刷新令牌') as Error & { code: string }
    err.code = 'AUTH_INVALID_TOKEN'
    throw err
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    const err = new Error('用户不存在') as Error & { code: string }
    err.code = 'AUTH_INVALID_TOKEN'
    throw err
  }
  if (user.isBanned) {
    const err = new Error('账号已被封禁') as Error & { code: string }
    err.code = 'AUTH_USER_BANNED'
    throw err
  }

  return { accessToken: makeAccessToken(user) }
}

/**
 * Invalidate an access token by adding it to the blacklist.
 */
export async function logout(token: string): Promise<void> {
  const expiresAt = Date.now() + parseDurationMs(ACCESS_TTL)
  tokenBlacklist.add(token, expiresAt)
}

/**
 * Initiate password reset — generates a token, persists it, and emails the user.
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } })

  // Always resolve successfully to avoid leaking whether the email exists
  if (!user) return

  const resetToken = uuidv4()
  const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExp },
  })

  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173'
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`

  await sendPasswordResetEmail(email, resetUrl)
}

/**
 * Complete password reset using the one-time token.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  })

  if (!user || !user.resetTokenExp) {
    const err = new Error('无效或已使用的重置令牌') as Error & { code: string }
    err.code = 'AUTH_INVALID_TOKEN'
    throw err
  }

  if (user.resetTokenExp < new Date()) {
    const err = new Error('重置令牌已过期，请重新申请') as Error & { code: string }
    err.code = 'AUTH_TOKEN_EXPIRED'
    throw err
  }

  const hashed = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
    },
  })
}
