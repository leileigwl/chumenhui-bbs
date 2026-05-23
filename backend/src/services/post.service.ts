import prisma from '../lib/prisma.js'
import { sanitizeHtml, extractExcerpt, extractCoverUrl } from './sanitize.service.js'
import type { Post, ReviewStatus, PostStatus } from '@prisma/client'

const POST_INCLUDE = {
  user: {
    select: { id: true, nickname: true, avatar: true, level: true },
  },
  category: true,
  tags: {
    include: { tag: true },
  },
} as const

export interface CreatePostInput {
  title: string
  content: string
  categoryId: string
  tags?: string[]
  coverUrl?: string
  imageAspect?: number
}

export interface GetPostsParams {
  categoryId?: string
  sort: 'hot' | 'latest' | 'elite'
  page: number
  limit: number
  userId?: number
}

export interface PostWithMeta extends Post {
  isLiked?: boolean
  isBookmarked?: boolean
  user: { id: number; nickname: string | null; avatar: string | null; level: string }
  category: { id: string; label: string; color: string; bg: string; sort: number }
  tags: Array<{ tag: { id: number; name: string } }>
}

export async function createPost(
  userId: number,
  input: CreatePostInput
): Promise<Post> {
  const cleanContent = sanitizeHtml(input.content)
  const excerpt = extractExcerpt(input.content)
  const coverUrl = input.coverUrl || extractCoverUrl(input.content)

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        userId,
        categoryId: input.categoryId,
        title: input.title,
        content: cleanContent,
        excerpt,
        coverUrl,
        imageAspect: input.imageAspect,
        reviewStatus: 'PENDING' as ReviewStatus,
        status: 'PUBLISHED' as PostStatus,
      },
    })

    if (input.tags && input.tags.length > 0) {
      for (const tagName of input.tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        await tx.postTag.create({
          data: { postId: created.id, tagId: tag.id },
        })
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: { postCount: { increment: 1 } },
    })

    return created
  })

  return post
}

export async function getPosts(params: GetPostsParams): Promise<{ posts: PostWithMeta[]; total: number }> {
  const { categoryId, sort, page, limit, userId } = params
  const skip = (page - 1) * limit

  const where = {
    reviewStatus: 'APPROVED' as ReviewStatus,
    status: 'PUBLISHED' as PostStatus,
    ...(categoryId ? { categoryId } : {}),
    ...(sort === 'elite' ? { isElite: true } : {}),
  }

  const orderBy =
    sort === 'hot'
      ? { hotScore: 'desc' as const }
      : { createdAt: 'desc' as const }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: POST_INCLUDE,
    }),
    prisma.post.count({ where }),
  ])

  if (!userId) {
    return { posts: posts as unknown as PostWithMeta[], total }
  }

  const postIds = posts.map((p) => p.id)

  const [likes, bookmarks] = await Promise.all([
    prisma.like.findMany({
      where: {
        userId,
        targetId: { in: postIds },
        targetType: 'POST',
      },
      select: { targetId: true },
    }),
    prisma.bookmark.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ])

  const likedSet = new Set(likes.map((l) => l.targetId))
  const bookmarkedSet = new Set(bookmarks.map((b) => b.postId))

  const postsWithMeta = posts.map((p) => ({
    ...p,
    isLiked: likedSet.has(p.id),
    isBookmarked: bookmarkedSet.has(p.id),
  }))

  return { posts: postsWithMeta as unknown as PostWithMeta[], total }
}

export async function getPostById(
  postId: number,
  currentUserId?: number
): Promise<PostWithMeta & { isLiked: boolean; isBookmarked: boolean }> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: POST_INCLUDE,
  })

  if (!post) {
    throw Object.assign(new Error('Post not found'), { statusCode: 404, code: 'POST_NOT_FOUND' })
  }

  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  })

  let isLiked = false
  let isBookmarked = false

  if (currentUserId) {
    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_targetId_targetType: {
            userId: currentUserId,
            targetId: postId,
            targetType: 'POST',
          },
        },
      }),
      prisma.bookmark.findUnique({
        where: { userId_postId: { userId: currentUserId, postId } },
      }),
    ])
    isLiked = like !== null
    isBookmarked = bookmark !== null
  }

  return { ...(post as unknown as PostWithMeta), isLiked, isBookmarked }
}

export async function deletePost(postId: number, userId: number, role: string): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId } })

  if (!post) {
    throw Object.assign(new Error('Post not found'), { statusCode: 404, code: 'POST_NOT_FOUND' })
  }

  if (post.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' })
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'DELETED' as PostStatus },
  })
}

export async function getHotPosts(): Promise<Post[]> {
  return prisma.post.findMany({
    where: {
      reviewStatus: 'APPROVED' as ReviewStatus,
      status: 'PUBLISHED' as PostStatus,
    },
    orderBy: { hotScore: 'desc' },
    take: 20,
    include: POST_INCLUDE,
  })
}

export async function calculateHotScore(): Promise<void> {
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED' as PostStatus,
      reviewStatus: 'APPROVED' as ReviewStatus,
    },
    select: {
      id: true,
      likeCount: true,
      commentCount: true,
      bookmarkCount: true,
      viewCount: true,
      createdAt: true,
    },
  })

  const now = Date.now()

  await prisma.$transaction(
    posts.map((post) => {
      const ageHours = (now - post.createdAt.getTime()) / 3_600_000
      const score =
        (post.likeCount + post.commentCount * 2 + post.bookmarkCount * 1.5 + post.viewCount * 0.1) /
        Math.pow(ageHours + 2, 1.5)

      return prisma.post.update({
        where: { id: post.id },
        data: { hotScore: score },
      })
    })
  )
}
