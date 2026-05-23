import prisma from '../lib/prisma.js'
import { createNotification } from './notification.service.js'
import type { User, Post } from '@prisma/client'

export interface UserProfile {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
  bio: string | null
  title: string | null
  website: string | null
  level: string
  role: string
  postCount: number
  likeCount: number
  followerCount: number
  followingCount: number
  isBanned: boolean
  createdAt: Date
  isFollowing: boolean
  recentPosts: Post[]
}

export async function getUserById(
  id: number,
  currentUserId?: number,
): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { reviewStatus: 'APPROVED', status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      },
    },
  })

  if (!user) {
    throw Object.assign(new Error('用户不存在'), { statusCode: 404, code: 'USER_NOT_FOUND' })
  }

  let isFollowing = false
  if (currentUserId && currentUserId !== id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: id,
        },
      },
    })
    isFollowing = follow !== null
  }

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    bio: user.bio,
    title: user.title,
    website: user.website,
    level: user.level,
    role: user.role,
    postCount: user.postCount,
    likeCount: user.likeCount,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    isFollowing,
    recentPosts: user.posts,
  }
}

export interface UpdateMeParams {
  nickname?: string
  avatar?: string
  bio?: string
  title?: string
  website?: string
}

export async function updateMe(userId: number, params: UpdateMeParams): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(params.nickname !== undefined && { nickname: params.nickname }),
      ...(params.avatar !== undefined && { avatar: params.avatar }),
      ...(params.bio !== undefined && { bio: params.bio }),
      ...(params.title !== undefined && { title: params.title }),
      ...(params.website !== undefined && { website: params.website }),
    },
  })
  return user
}

export async function getMyBookmarks(
  userId: number,
  { page, limit }: { page: number; limit: number },
): Promise<{ posts: unknown[]; total: number }> {
  const skip = (page - 1) * limit

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true,
                level: true,
              },
            },
            category: true,
            tags: { include: { tag: true } },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ])

  const posts = bookmarks.map((b) => b.post)
  return { posts, total }
}

export async function followUser(
  followerId: number,
  followingId: number,
): Promise<{ following: boolean }> {
  if (followerId === followingId) {
    throw Object.assign(new Error('不能关注自己'), { statusCode: 400, code: 'CANNOT_FOLLOW_SELF' })
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  })

  if (existing) {
    // Toggle off — unfollow
    await prisma.$transaction([
      prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { decrement: 1 } },
      }),
    ])
    return { following: false }
  }

  // Follow
  await prisma.$transaction([
    prisma.follow.create({
      data: { followerId, followingId },
    }),
    prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: followingId },
      data: { followerCount: { increment: 1 } },
    }),
  ])

  // Create follow notification (fire-and-forget, don't fail the request if this errors)
  createNotification({
    userId: followingId,
    actorId: followerId,
    type: 'FOLLOW',
    targetId: followerId,
    targetType: 'user',
  }).catch(() => {
    // Intentionally ignore notification errors
  })

  return { following: true }
}

export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })

  if (!existing) return

  await prisma.$transaction([
    prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    }),
    prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: followingId },
      data: { followerCount: { decrement: 1 } },
    }),
  ])
}
