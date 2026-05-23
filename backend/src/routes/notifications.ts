import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { addConnection, removeConnection } from '../services/notification.service.js'

export default async function notificationsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /notifications — paginated list + unreadCount
  fastify.get(
    '/',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId
      const query = request.query as { page?: string; limit?: string }
      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '20', 10)))
      const skip = (page - 1) * limit

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: { id: true, username: true, nickname: true, avatar: true },
            },
          },
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ])

      return reply.send({
        success: true,
        data: { notifications, unreadCount },
        meta: { total, page, limit },
      })
    },
  )

  // PUT /notifications/read — mark all as read
  fastify.put(
    '/read',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })

      return reply.send({ success: true, data: { message: '已全部标记为已读' } })
    },
  )

  // GET /notifications/stream — SSE endpoint
  fastify.get(
    '/stream',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId

      // Set SSE headers
      reply.raw.setHeader('Content-Type', 'text/event-stream')
      reply.raw.setHeader('Cache-Control', 'no-cache')
      reply.raw.setHeader('Connection', 'keep-alive')
      reply.raw.setHeader('X-Accel-Buffering', 'no')
      reply.raw.flushHeaders()

      addConnection(userId, reply)

      // Send initial connection confirmation
      reply.raw.write(': connected\n\n')

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          reply.raw.write(': heartbeat\n\n')
        } catch {
          clearInterval(heartbeat)
        }
      }, 30_000)

      // Cleanup on disconnect
      request.raw.on('close', () => {
        clearInterval(heartbeat)
        removeConnection(userId, reply)
      })

      // Prevent Fastify from auto-ending the response
      await new Promise<void>((resolve) => {
        request.raw.on('close', resolve)
      })
    },
  )
}
