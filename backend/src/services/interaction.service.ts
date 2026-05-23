import prisma from '../lib/prisma.js'

export async function likePost(userId: number, postId: number): Promise<{ liked: boolean }> {
  const existing = await prisma.like.findUnique({
    where: {
      userId_targetId_targetType: {
        userId,
        targetId: postId,
        targetType: 'POST',
      },
    },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({
        where: {
          userId_targetId_targetType: {
            userId,
            targetId: postId,
            targetType: 'POST',
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ])
    return { liked: false }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  if (!post) {
    throw Object.assign(new Error('Post not found'), { statusCode: 404, code: 'POST_NOT_FOUND' })
  }

  await prisma.$transaction([
    prisma.like.create({
      data: { userId, targetId: postId, targetType: 'POST' },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    }),
  ])

  if (post.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        actorId: userId,
        type: 'LIKE',
        targetId: postId,
        targetType: 'POST',
      },
    })
  }

  return { liked: true }
}

export async function likeComment(userId: number, commentId: number): Promise<{ liked: boolean }> {
  const existing = await prisma.like.findUnique({
    where: {
      userId_targetId_targetType: {
        userId,
        targetId: commentId,
        targetType: 'COMMENT',
      },
    },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({
        where: {
          userId_targetId_targetType: {
            userId,
            targetId: commentId,
            targetType: 'COMMENT',
          },
        },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ])
    return { liked: false }
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!comment) {
    throw Object.assign(new Error('Comment not found'), { statusCode: 404, code: 'COMMENT_NOT_FOUND' })
  }

  await prisma.$transaction([
    prisma.like.create({
      data: { userId, targetId: commentId, targetType: 'COMMENT' },
    }),
    prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    }),
  ])

  if (comment.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: comment.userId,
        actorId: userId,
        type: 'LIKE',
        targetId: commentId,
        targetType: 'COMMENT',
      },
    })
  }

  return { liked: true }
}

export async function bookmarkPost(userId: number, postId: number): Promise<{ bookmarked: boolean }> {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.bookmark.delete({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { bookmarkCount: { decrement: 1 } },
      }),
    ])
    return { bookmarked: false }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!post) {
    throw Object.assign(new Error('Post not found'), { statusCode: 404, code: 'POST_NOT_FOUND' })
  }

  await prisma.$transaction([
    prisma.bookmark.create({
      data: { userId, postId },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { increment: 1 } },
    }),
  ])

  return { bookmarked: true }
}
