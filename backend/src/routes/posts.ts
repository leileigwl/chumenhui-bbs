import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  getHotPosts,
} from '../services/post.service.js'
import { likePost, bookmarkPost } from '../services/interaction.service.js'
import { createComment, getComments } from '../services/comment.service.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatePostBody {
  title: string
  content: string
  categoryId: string
  tags?: string[]
  coverUrl?: string
  imageAspect?: number
}

interface GetPostsQuery {
  category?: string
  sort?: 'hot' | 'latest' | 'elite'
  page?: number
  limit?: number
}

interface PostIdParams {
  id: number
}

interface CreateCommentBody {
  content: string
  parentId?: number
}

interface GetCommentsQuery {
  page?: number
  limit?: number
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default async function postsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /posts
  fastify.get<{ Querystring: GetPostsQuery }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            sort: { type: 'string', enum: ['hot', 'latest', 'elite'], default: 'latest' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          additionalProperties: false,
        },
      },
      preHandler: [optionalAuth],
    },
    async (request: FastifyRequest<{ Querystring: GetPostsQuery }>, reply: FastifyReply) => {
      const { category, sort = 'latest', page = 1, limit = 20 } = request.query
      const userId = request.user?.userId

      const { posts, total } = await getPosts({
        categoryId: category,
        sort,
        page,
        limit,
        userId,
      })

      return reply.send({
        success: true,
        data: posts,
        meta: { total, page, limit },
      })
    },
  )

  // GET /posts/hot
  fastify.get(
    '/hot',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const posts = await getHotPosts()
      return reply.send({ success: true, data: posts })
    },
  )

  // POST /posts
  fastify.post<{ Body: CreatePostBody }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'content', 'categoryId'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            content: { type: 'string', minLength: 1 },
            categoryId: { type: 'string', minLength: 1 },
            tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 10 },
            coverUrl: { type: 'string', maxLength: 500 },
            imageAspect: { type: 'number' },
          },
          additionalProperties: false,
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Body: CreatePostBody }>, reply: FastifyReply) => {
      const userId = request.user.userId
      const post = await createPost(userId, request.body)
      return reply.code(201).send({ success: true, data: post })
    },
  )

  // GET /posts/:id
  fastify.get<{ Params: PostIdParams }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [optionalAuth],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const userId = request.user?.userId
      const post = await getPostById(request.params.id, userId)
      return reply.send({ success: true, data: post })
    },
  )

  // DELETE /posts/:id
  fastify.delete<{ Params: PostIdParams }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const { userId, role } = request.user
      await deletePost(request.params.id, userId, role)
      return reply.send({ success: true, data: null })
    },
  )

  // POST /posts/:id/like
  fastify.post<{ Params: PostIdParams }>(
    '/:id/like',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const result = await likePost(request.user.userId, request.params.id)
      return reply.send({ success: true, data: result })
    },
  )

  // DELETE /posts/:id/like  (toggle — same handler)
  fastify.delete<{ Params: PostIdParams }>(
    '/:id/like',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const result = await likePost(request.user.userId, request.params.id)
      return reply.send({ success: true, data: result })
    },
  )

  // POST /posts/:id/bookmark
  fastify.post<{ Params: PostIdParams }>(
    '/:id/bookmark',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const result = await bookmarkPost(request.user.userId, request.params.id)
      return reply.send({ success: true, data: result })
    },
  )

  // DELETE /posts/:id/bookmark
  fastify.delete<{ Params: PostIdParams }>(
    '/:id/bookmark',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Params: PostIdParams }>, reply: FastifyReply) => {
      const result = await bookmarkPost(request.user.userId, request.params.id)
      return reply.send({ success: true, data: result })
    },
  )

  // GET /posts/:id/comments
  fastify.get<{ Params: PostIdParams; Querystring: GetCommentsQuery }>(
    '/:id/comments',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          additionalProperties: false,
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PostIdParams; Querystring: GetCommentsQuery }>,
      reply: FastifyReply,
    ) => {
      const { page = 1, limit = 20 } = request.query
      const { comments, total } = await getComments(request.params.id, { page, limit })
      return reply.send({
        success: true,
        data: comments,
        meta: { total, page, limit },
      })
    },
  )

  // POST /posts/:id/comments
  fastify.post<{ Params: PostIdParams; Body: CreateCommentBody }>(
    '/:id/comments',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string', minLength: 1, maxLength: 5000 },
            parentId: { type: 'integer' },
          },
          additionalProperties: false,
        },
      },
      preHandler: [authenticate],
    },
    async (
      request: FastifyRequest<{ Params: PostIdParams; Body: CreateCommentBody }>,
      reply: FastifyReply,
    ) => {
      const userId = request.user.userId
      const comment = await createComment(userId, request.params.id, request.body)
      return reply.code(201).send({ success: true, data: comment })
    },
  )
}
