import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'

const adminPreHandler = [authenticate, requireAdmin]

export default async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  // ─── Post Management ──────────────────────────────────────────────────────

  // GET /admin/posts?status=pending|approved|rejected&page=1&limit=20
  fastify.get(
    '/posts',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string
        page?: string
        limit?: string
      }

      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
      const skip = (page - 1) * limit

      const statusMap: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
        pending: 'PENDING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
      }

      const reviewStatus = query.status ? statusMap[query.status.toLowerCase()] : undefined

      const where = {
        ...(reviewStatus ? { reviewStatus } : {}),
        status: { not: 'DELETED' as const },
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true, nickname: true, avatar: true },
            },
            category: true,
          },
        }),
        prisma.post.count({ where }),
      ])

      return reply.send({
        success: true,
        data: posts,
        meta: { total, page, limit },
      })
    },
  )

  // PUT /admin/posts/:id/approve
  fastify.put(
    '/posts/:id/approve',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const postId = parseInt(id, 10)
      if (isNaN(postId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的帖子ID' },
        })
      }

      const post = await prisma.post.update({
        where: { id: postId },
        data: { reviewStatus: 'APPROVED' },
      })

      return reply.send({ success: true, data: post })
    },
  )

  // PUT /admin/posts/:id/reject
  fastify.put(
    '/posts/:id/reject',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const postId = parseInt(id, 10)
      if (isNaN(postId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的帖子ID' },
        })
      }

      const post = await prisma.post.update({
        where: { id: postId },
        data: { reviewStatus: 'REJECTED' },
      })

      return reply.send({ success: true, data: post })
    },
  )

  // DELETE /admin/posts/:id
  fastify.delete(
    '/posts/:id',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const postId = parseInt(id, 10)
      if (isNaN(postId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的帖子ID' },
        })
      }

      await prisma.post.update({
        where: { id: postId },
        data: { status: 'DELETED' },
      })

      return reply.send({ success: true, data: { message: '帖子已删除' } })
    },
  )

  // PUT /admin/posts/:id/elite — toggle isElite
  fastify.put(
    '/posts/:id/elite',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const postId = parseInt(id, 10)
      if (isNaN(postId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的帖子ID' },
        })
      }

      const current = await prisma.post.findUnique({
        where: { id: postId },
        select: { isElite: true },
      })

      if (!current) {
        return reply.code(404).send({
          success: false,
          error: { code: 'POST_NOT_FOUND', message: '帖子不存在' },
        })
      }

      const post = await prisma.post.update({
        where: { id: postId },
        data: { isElite: !current.isElite },
      })

      return reply.send({ success: true, data: post })
    },
  )

  // ─── User Management ──────────────────────────────────────────────────────

  // GET /admin/users?page=1&limit=20&banned=true|false
  fastify.get(
    '/users',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        page?: string
        limit?: string
        banned?: string
      }

      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
      const skip = (page - 1) * limit

      const where: { isBanned?: boolean } = {}
      if (query.banned === 'true') where.isBanned = true
      else if (query.banned === 'false') where.isBanned = false

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            username: true,
            email: true,
            nickname: true,
            avatar: true,
            level: true,
            role: true,
            isBanned: true,
            postCount: true,
            followerCount: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ])

      return reply.send({
        success: true,
        data: users,
        meta: { total, page, limit },
      })
    },
  )

  // PUT /admin/users/:id/ban
  fastify.put(
    '/users/:id/ban',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const userId = parseInt(id, 10)
      if (isNaN(userId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的用户ID' },
        })
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: true },
        select: {
          id: true,
          username: true,
          isBanned: true,
        },
      })

      return reply.send({ success: true, data: user })
    },
  )

  // PUT /admin/users/:id/unban
  fastify.put(
    '/users/:id/unban',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const userId = parseInt(id, 10)
      if (isNaN(userId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的用户ID' },
        })
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false },
        select: {
          id: true,
          username: true,
          isBanned: true,
        },
      })

      return reply.send({ success: true, data: user })
    },
  )
}
