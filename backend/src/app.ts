import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'

import { corsPlugin } from './plugins/cors.js'
import { jwtPlugin } from './plugins/jwt.js'
import { multipartPlugin } from './plugins/multipart.js'
import { setJwtSign } from './services/auth.service.js'
import authRoutes from './routes/auth.js'
import postsRoutes from './routes/posts.js'
import commentsRoutes from './routes/comments.js'
import categoriesRoutes from './routes/categories.js'
import uploadRoutes from './routes/upload.js'
import usersRoutes from './routes/users.js'
import notificationsRoutes from './routes/notifications.js'
import searchRoutes from './routes/search.js'
import adminRoutes from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  })

  // ── Global error handler (must be before register() calls) ──────────────────
  fastify.setErrorHandler(async (error, _request, reply) => {
    const statusCode = error.statusCode ?? 500
    const log = fastify.log

    // Fastify validation errors
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.validation,
        },
      })
    }

    // Typed application errors
    const appError = error as Error & { code?: string }
    const knownCodes = new Set([
      'AUTH_EMAIL_EXISTS',
      'AUTH_USERNAME_EXISTS',
      'AUTH_INVALID_CREDENTIALS',
      'AUTH_USER_BANNED',
      'AUTH_TOKEN_EXPIRED',
      'AUTH_INVALID_TOKEN',
      'AUTH_FORBIDDEN',
      'NOT_FOUND',
      'POST_NOT_FOUND',
      'COMMENT_NOT_FOUND',
      'FORBIDDEN',
      'INVALID_PARENT',
      'NO_FILE',
      'INVALID_FILE_TYPE',
    ])

    if (appError.code && knownCodes.has(appError.code)) {
      const httpStatus =
        appError.code === 'AUTH_FORBIDDEN' || appError.code === 'FORBIDDEN' ? 403
        : appError.code === 'NOT_FOUND' || appError.code === 'POST_NOT_FOUND' || appError.code === 'COMMENT_NOT_FOUND' ? 404
        : appError.code === 'AUTH_USER_BANNED' ? 403
        : 400

      return reply.code(httpStatus).send({
        success: false,
        error: { code: appError.code, message: appError.message },
      })
    }

    log.error({ err: error }, 'Unhandled error')

    return reply.code(statusCode < 500 ? statusCode : 500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env['NODE_ENV'] === 'production'
            ? '服务器内部错误'
            : (error.message ?? '服务器内部错误'),
      },
    })
  })

  // 404 handler
  fastify.setNotFoundHandler(async (_request, reply) => {
    return reply.code(404).send({
      success: false,
      error: { code: 'NOT_FOUND', message: '接口不存在' },
    })
  })

  // ── Plugins ──────────────────────────────────────────────────────────────────
  await corsPlugin(fastify)
  await jwtPlugin(fastify)
  await multipartPlugin(fastify)

  // Wire the JWT sign function into the auth service
  setJwtSign((payload, options) => fastify.jwt.sign(payload, options as Parameters<typeof fastify.jwt.sign>[1]))

  // Static file serving for user uploads
  const uploadDir = path.resolve(
    process.env['UPLOAD_DIR'] ?? path.join(__dirname, '..', 'uploads'),
  )
  await fastify.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
  })

  // ── Health check ─────────────────────────────────────────────────────────────
  fastify.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // ── API routes ───────────────────────────────────────────────────────────────
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' })
  await fastify.register(postsRoutes, { prefix: '/api/v1/posts' })
  await fastify.register(commentsRoutes, { prefix: '/api/v1/comments' })
  await fastify.register(categoriesRoutes, { prefix: '/api/v1/categories' })
  await fastify.register(uploadRoutes, { prefix: '/api/v1/upload' })
  await fastify.register(usersRoutes, { prefix: '/api/v1/users' })
  await fastify.register(notificationsRoutes, { prefix: '/api/v1/notifications' })
  await fastify.register(searchRoutes, { prefix: '/api/v1/search' })
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' })

  return fastify
}
