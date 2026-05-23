import type { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Require the authenticated user to have the ADMIN role.
 * Must be used AFTER the authenticate middleware (request.user must be populated).
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.user || request.user.role !== 'ADMIN') {
    return reply.code(403).send({
      success: false,
      error: { code: 'AUTH_FORBIDDEN', message: '权限不足，需要管理员身份' },
    })
  }
}
