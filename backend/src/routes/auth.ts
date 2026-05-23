import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  register,
  login,
  refreshTokenFromPayload,
  logout,
  forgotPassword,
  resetPassword,
} from '../services/auth.service.js'

// ─── JSON Schema definitions ──────────────────────────────────────────────────

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'username'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 6, maxLength: 100 },
      username: { type: 'string', minLength: 2, maxLength: 50 },
      nickname: { type: 'string', maxLength: 50 },
    },
    additionalProperties: false,
  },
} as const

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
} as const

const refreshSchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const

const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
} as const

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'newPassword'],
    properties: {
      token: { type: 'string', minLength: 1 },
      newPassword: { type: 'string', minLength: 6, maxLength: 100 },
    },
    additionalProperties: false,
  },
} as const

// ─── Safe user projection (omit sensitive fields) ────────────────────────────

function safeUser(user: {
  id: number
  username: string
  email: string
  nickname: string | null
  avatar: string | null
  bio: string | null
  title: string | null
  website: string | null
  level: string
  role: string
  postCount: number
  likeCount: number
  followerCount: number
  followingCount: number
  isBanned: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    bio: user.bio,
    title: user.title,
    website: user.website,
    level: user.level,
    role: user.role,
    postCount: user.postCount,
    likeCount: user.likeCount,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// ─── Route handler types ──────────────────────────────────────────────────────

interface RegisterBody {
  email: string
  password: string
  username: string
  nickname?: string
}

interface LoginBody {
  email: string
  password: string
}

interface RefreshBody {
  refreshToken: string
}

interface ForgotPasswordBody {
  email: string
}

interface ResetPasswordBody {
  token: string
  newPassword: string
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/register
  fastify.post(
    '/register',
    { schema: registerSchema },
    async (
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      const { email, password, username, nickname } = request.body
      const user = await register(email, password, username, nickname)
      return reply.code(201).send({
        success: true,
        data: { user: safeUser(user) },
      })
    },
  )

  // POST /auth/login
  fastify.post(
    '/login',
    { schema: loginSchema },
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply,
    ) => {
      const { email, password } = request.body
      const { user, accessToken, refreshToken } = await login(email, password)
      return reply.send({
        success: true,
        data: { user: safeUser(user), accessToken, refreshToken },
      })
    },
  )

  // POST /auth/refresh
  fastify.post(
    '/refresh',
    { schema: refreshSchema },
    async (
      request: FastifyRequest<{ Body: RefreshBody }>,
      reply: FastifyReply,
    ) => {
      const { refreshToken } = request.body

      // Verify the body token via the Fastify instance
      let decoded: { userId: number; email: string; role: string; type: string }
      try {
        decoded = fastify.jwt.verify<{
          userId: number
          email: string
          role: string
          type: string
        }>(refreshToken)
      } catch {
        return reply.code(401).send({
          success: false,
          error: { code: 'AUTH_INVALID_TOKEN', message: '无效或已过期的刷新令牌' },
        })
      }

      const { accessToken } = await refreshTokenFromPayload({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type as 'access' | 'refresh',
      })

      return reply.send({ success: true, data: { accessToken } })
    },
  )

  // POST /auth/logout (requires authentication)
  fastify.post(
    '/logout',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawToken = request.headers.authorization?.replace(/^Bearer\s+/i, '')
      if (rawToken) {
        await logout(rawToken)
      }
      return reply.send({ success: true, data: null })
    },
  )

  // POST /auth/forgot-password
  fastify.post(
    '/forgot-password',
    { schema: forgotPasswordSchema },
    async (
      request: FastifyRequest<{ Body: ForgotPasswordBody }>,
      reply: FastifyReply,
    ) => {
      await forgotPassword(request.body.email)
      // Always respond with success to prevent email enumeration
      return reply.send({
        success: true,
        data: { message: '如果该邮箱存在，重置链接已发送' },
      })
    },
  )

  // POST /auth/reset-password
  fastify.post(
    '/reset-password',
    { schema: resetPasswordSchema },
    async (
      request: FastifyRequest<{ Body: ResetPasswordBody }>,
      reply: FastifyReply,
    ) => {
      const { token, newPassword } = request.body
      await resetPassword(token, newPassword)
      return reply.send({ success: true, data: { message: '密码重置成功' } })
    },
  )
}
