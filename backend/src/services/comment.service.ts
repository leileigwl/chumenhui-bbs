import prisma from '../lib/prisma.js'
import type { Comment } from '@prisma/client'

const COMMENT_USER_SELECT = {
  select: { id: true, nickname: true, avatar: true, level: true },
} as const

export interface CreateCommentInput {
  content: string
  parentId?: number
}

export async function createComment(
  userId: number,
  postId: number,
  input: CreateCommentInput
): Promise<Comment> {
  if (input.parentId !== undefined) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { postId: true, userId: true },
    })

    if (!parent) {
      throw Object.assign(new Error('Parent comment not found'), {
        statusCode: 404,
        code: 'COMMENT_NOT_FOUND',
      })
    }

    if (parent.postId !== postId) {
      throw Object.assign(new Error('Parent comment does not belong to this post'), {
        statusCode: 400,
        code: 'INVALID_PARENT',
      })
    }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  if (!post) {
    throw Object.assign(new Error('Post not found'), { statusCode: 404, code: 'POST_NOT_FOUND' })
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        userId,
        postId,
        content: input.content,
        parentId: input.parentId ?? null,
      },
    })

    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    return created
  })

  const notifyUserId =
    input.parentId !== undefined
      ? await getParentCommentAuthor(input.parentId)
      : post.userId

  if (notifyUserId !== userId) {
    const notificationType = input.parentId !== undefined ? 'REPLY' : 'COMMENT'
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        actorId: userId,
        type: notificationType,
        targetId: comment.id,
        targetType: 'COMMENT',
      },
    })
  }

  return comment
}

async function getParentCommentAuthor(parentId: number): Promise<number> {
  const parent = await prisma.comment.findUnique({
    where: { id: parentId },
    select: { userId: true },
  })
  return parent?.userId ?? 0
}

export interface GetCommentsParams {
  page: number
  limit: number
}

export async function getComments(
  postId: number,
  params: GetCommentsParams
): Promise<{ comments: unknown[]; total: number }> {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const where = {
    postId,
    parentId: null,
    status: 'VISIBLE' as const,
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: COMMENT_USER_SELECT,
        replies: {
          where: { status: 'VISIBLE' },
          orderBy: { createdAt: 'asc' },
          take: 3,
          include: {
            user: COMMENT_USER_SELECT,
          },
        },
      },
    }),
    prisma.comment.count({ where }),
  ])

  return { comments, total }
}

export async function deleteComment(
  commentId: number,
  userId: number,
  role: string
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, postId: true, status: true },
  })

  if (!comment) {
    throw Object.assign(new Error('Comment not found'), { statusCode: 404, code: 'COMMENT_NOT_FOUND' })
  }

  if (comment.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' })
  }

  await prisma.$transaction([
    prisma.comment.update({
      where: { id: commentId },
      data: { status: 'DELETED' },
    }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    }),
  ])
}
