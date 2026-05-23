import type { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'

export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  const configuredOrigin = process.env['FRONTEND_URL'] ?? 'http://localhost:5173'
  const allowedOrigins = new Set([
    configuredOrigin,
    configuredOrigin.replace('localhost', '127.0.0.1'),
    configuredOrigin.replace('127.0.0.1', 'localhost'),
  ])

  await fastify.register(fastifyCors, {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
