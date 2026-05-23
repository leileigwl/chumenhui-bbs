import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import {
  getUserById,
  updateMe,
  getMyBookmarks,
  followUser,
  unfollowUser,
} from '../services/user.service.js'

export default async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /users/me/bookmarks — must be registered before /:id to avoid conflict
  fastify.get(
    '/me/bookmarks',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId
      const query = request.query as { page?: string; limit?: string }
      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '20', 10)))

      const { posts, total } = await getMyBookmarks(userId, { page, limit })

      return reply.send({
        success: true,
        data: posts,
        meta: { total, page, limit },
      })
    },
  )

  // GET /users/:id
  fastify.get(
    '/:id',
    { preHandler: [optionalAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const userId = parseInt(id, 10)
      if (isNaN(userId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的用户ID' },
        })
      }

      const currentUserId = request.user?.userId
      const profile = await getUserById(userId, currentUserId)

      return reply.send({ success: true, data: profile })
    },
  )

  // PUT /users/me
  fastify.put(
    '/me',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.userId
      const body = request.body as {
        nickname?: string
        avatar?: string
        bio?: string
        title?: string
        website?: string
      }

      const user = await updateMe(userId, {
        nickname: body.nickname,
        avatar: body.avatar,
        bio: body.bio,
        title: body.title,
        website: body.website,
      })

      // Omit sensitive fields from response
      const { password, resetToken, resetTokenExp, ...safeUser } = user

      return reply.send({ success: true, data: safeUser })
    },
  )

  // POST /users/:id/follow
  fastify.post(
    '/:id/follow',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const followingId = parseInt(id, 10)
      if (isNaN(followingId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的用户ID' },
        })
      }

      const followerId = request.user.userId
      const result = await followUser(followerId, followingId)

      return reply.send({ success: true, data: result })
    },
  )

  // DELETE /users/:id/follow
  fastify.delete(
    '/:id/follow',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string }
      const followingId = parseInt(id, 10)
      if (isNaN(followingId)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PARAM', message: '无效的用户ID' },
        })
      }

      const followerId = request.user.userId
      await unfollowUser(followerId, followingId)

      return reply.send({ success: true, data: { following: false } })
    },
  )
}
