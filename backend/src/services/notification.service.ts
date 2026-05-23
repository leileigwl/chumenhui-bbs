import type { FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'
import type { NotificationType } from '@prisma/client'

// SSE connection pool: userId → list of SSE reply objects
const connections = new Map<number, FastifyReply[]>()

export function addConnection(userId: number, reply: FastifyReply): void {
  const existing = connections.get(userId) ?? []
  connections.set(userId, [...existing, reply])
}

export function removeConnection(userId: number, reply: FastifyReply): void {
  const existing = connections.get(userId)
  if (!existing) return

  const updated = existing.filter((r) => r !== reply)
  if (updated.length === 0) {
    connections.delete(userId)
  } else {
    connections.set(userId, updated)
  }
}

function pushSSE(userId: number, data: Record<string, unknown>): void {
  const userConnections = connections.get(userId)
  if (!userConnections || userConnections.length === 0) return

  const payload = `data: ${JSON.stringify(data)}\n\n`

  for (const reply of userConnections) {
    try {
      reply.raw.write(payload)
    } catch {
      // Connection may have closed; remove it silently
      removeConnection(userId, reply)
    }
  }
}

export interface CreateNotificationParams {
  userId: number
  actorId: number
  type: NotificationType
  targetId: number
  targetType: string
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { userId, actorId, type, targetId, targetType } = params

  // Don't notify yourself
  if (userId === actorId) return

  const notification = await prisma.notification.create({
    data: { userId, actorId, type, targetId, targetType },
    include: {
      actor: {
        select: { id: true, username: true, nickname: true, avatar: true },
      },
    },
  })

  // Push to online connections
  pushSSE(userId, {
    id: notification.id,
    type: notification.type,
    actorId: notification.actorId,
    actor: notification.actor,
    targetId: notification.targetId,
    targetType: notification.targetType,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  })
}
