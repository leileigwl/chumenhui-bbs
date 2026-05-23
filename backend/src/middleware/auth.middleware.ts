import type { FastifyReply, FastifyRequest } from 'fastify'
import { tokenBlacklist } from '../lib/redis.js'

/**
 * Strict authentication — rejects the request with 401 if no valid token is present.
 * Use as a preHandler on protected routes.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()

    const rawToken = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (rawToken && tokenBlacklist.has(rawToken)) {
      return reply.code(401).send({
        success: false,
        error: { code: 'AUTH_TOKEN_EXPIRED', message: '令牌已失效，请重新登录' },
      })
    }

    if (request.user.type !== 'access') {
      return reply.code(401).send({
        success: false,
        error: { code: 'AUTH_INVALID_TOKEN', message: '无效的令牌类型' },
      })
    }
  } catch {
    return reply.code(401).send({
      success: false,
      error: { code: 'AUTH_TOKEN_EXPIRED', message: '未授权，请先登录' },
    })
  }
}

/**
 * Optional authentication — populates request.user if a valid token is present,
 * but does NOT reject the request if the token is missing or invalid.
 * Use for public routes that benefit from knowing the current user.
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader) return

  try {
    await request.jwtVerify()

    const rawToken = authHeader.replace(/^Bearer\s+/i, '')
    if (tokenBlacklist.has(rawToken) || request.user.type !== 'access') {
      // Clear the user so downstream code treats this as unauthenticated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(request as any).user = undefined
    }
  } catch {
    // Ignore verification errors — treat as unauthenticated
  }
}
