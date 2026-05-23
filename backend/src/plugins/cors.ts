import type { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'

export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  const origin = process.env['FRONTEND_URL'] ?? 'http://localhost:5173'

  await fastify.register(fastifyCors, {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
