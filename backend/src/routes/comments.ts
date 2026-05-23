import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth.middleware.js'
import { deleteComment } from '../services/comment.service.js'
import { likeComment } from '../services/interaction.service.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentIdParams {
  id: number
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function commentsRoutes(fastify: FastifyInstance): Promise<void> {
  const paramSchema = {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
    },
  }

  // DELETE /comments/:id
  fastify.delete<{ Params: CommentIdParams }>(
    '/:id',
    { ...paramSchema, preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: CommentIdParams }>, reply: FastifyReply) => {
      const { userId, role } = request.user
      await deleteComment(request.params.id, userId, role)
      return reply.send({ success: true, data: null })
    },
  )

  // POST /comments/:id/like
  fastify.post<{ Params: CommentIdParams }>(
    '/:id/like',
    { ...paramSchema, preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: CommentIdParams }>, reply: FastifyReply) => {
      const result = await likeComment(request.user.userId, request.params.id)
      return reply.send({ success: true, data: result })
    },
  )
}
