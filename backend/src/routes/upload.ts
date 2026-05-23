import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth.middleware.js'
import { pipeline } from 'node:stream/promises'
import { createWriteStream, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export default async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /upload/image
  fastify.post(
    '/image',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads'

      try {
        mkdirSync(uploadDir, { recursive: true })
      } catch {
        // directory may already exist
      }

      let data: import('@fastify/multipart').MultipartFile | undefined
      try {
        data = await request.file({
          limits: { fileSize: MAX_FILE_SIZE },
        })
      } catch {
        return reply.code(400).send({
          success: false,
          error: { code: 'UPLOAD_ERROR', message: '文件上传失败' },
        })
      }

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: { code: 'NO_FILE', message: '未找到上传文件，字段名应为 file' },
        })
      }

      const mimeType = data.mimetype
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        // Drain the stream to avoid resource leak
        data.file.resume()
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: '不支持的文件类型，仅允许 jpeg/png/webp/gif',
          },
        })
      }

      const ext = MIME_TO_EXT[mimeType] ?? extname(data.filename) ?? '.jpg'
      const filename = `${uuidv4()}${ext}`
      const filePath = join(uploadDir, filename)

      try {
        await pipeline(data.file, createWriteStream(filePath))
      } catch {
        return reply.code(500).send({
          success: false,
          error: { code: 'SAVE_ERROR', message: '文件保存失败' },
        })
      }

      // Check if file exceeded size limit (stream truncated)
      if (data.file.truncated) {
        return reply.code(413).send({
          success: false,
          error: { code: 'FILE_TOO_LARGE', message: '文件大小超过 10MB 限制' },
        })
      }

      return reply.code(201).send({
        success: true,
        data: { url: `/uploads/${filename}` },
      })
    },
  )
}
