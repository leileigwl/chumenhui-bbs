import type { FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'

export async function multipartPlugin(fastify: FastifyInstance): Promise<void> {
  const maxFileSize = parseInt(
    process.env['MAX_FILE_SIZE'] ?? String(10 * 1024 * 1024),
    10,
  )

  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: maxFileSize,
      files: 5,
    },
  })
}
