import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'

export default async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /search?q=keyword&type=post|user&page=1&limit=20
  fastify.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        q?: string
        type?: string
        page?: string
        limit?: string
      }

      const q = (query.q ?? '').trim()
      if (!q) {
        return reply.code(400).send({
          success: false,
          error: { code: 'MISSING_QUERY', message: '搜索关键词不能为空' },
        })
      }

      const type = query.type === 'user' ? 'user' : 'post'
      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '20', 10)))
      const skip = (page - 1) * limit

      if (type === 'user') {
        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where: {
              OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { nickname: { contains: q, mode: 'insensitive' } },
              ],
            },
            skip,
            take: limit,
            select: {
              id: true,
              username: true,
              nickname: true,
              avatar: true,
              bio: true,
              level: true,
              title: true,
              followerCount: true,
              postCount: true,
            },
          }),
          prisma.user.count({
            where: {
              OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { nickname: { contains: q, mode: 'insensitive' } },
              ],
            },
          }),
        ])

        return reply.send({
          success: true,
          data: users,
          meta: { total, page, limit },
        })
      }

      // type === 'post'
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: {
            reviewStatus: 'APPROVED',
            status: 'PUBLISHED',
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true,
                level: true,
              },
            },
            category: true,
            tags: { include: { tag: true } },
          },
        }),
        prisma.post.count({
          where: {
            reviewStatus: 'APPROVED',
            status: 'PUBLISHED',
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          },
        }),
      ])

      return reply.send({
        success: true,
        data: posts,
        meta: { total, page, limit },
      })
    },
  )
}
