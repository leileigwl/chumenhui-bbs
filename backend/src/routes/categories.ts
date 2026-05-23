import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'

export default async function categoriesRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /categories
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' },
    })
    return reply.send({ success: true, data: categories })
  })
}
