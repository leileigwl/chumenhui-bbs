import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { tokenBlacklist } from '../lib/redis.js'

export interface JwtPayload {
  userId: number
  email: string
  role: string
  type: 'access' | 'refresh'
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
  }
}

export async function jwtPlugin(fastify: FastifyInstance): Promise<void> {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET environment variable is required')

  await fastify.register(fastifyJwt, { secret })

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify()

        // Reject blacklisted (logged-out) tokens
        const rawToken = request.headers.authorization?.replace(/^Bearer\s+/i, '')
        if (rawToken && tokenBlacklist.has(rawToken)) {
          return reply.code(401).send({
            success: false,
            error: { code: 'AUTH_TOKEN_EXPIRED', message: '令牌已失效，请重新登录' },
          })
        }

        // Ensure only access tokens are used for API authentication
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
    },
  )
}
