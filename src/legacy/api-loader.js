// api-loader.js — 从真实 API 加载数据，替代 data.js 的静态 mock

const API_BASE = 'http://localhost:3001/api/v1'

// 辅助函数：相对时间
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  if (mins < 60) return mins <= 1 ? '刚刚' : `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (weeks < 4) return `${weeks}周前`
  return `${Math.floor(weeks / 4)}个月前`
}

// 辅助函数：转换 level 枚举 → 中文
function levelLabel(level) {
  const map = { BEGINNER: '初阶', INTERMEDIATE: '进阶', ELITE: '精英', MENTOR: '导师' }
  return map[level] || '初阶'
}

// 转换 API user → 前端 user 格式
function adaptUser(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.nickname || apiUser.username,
    title: apiUser.title || '',
    followers: apiUser.followerCount || 0,
    posts: apiUser.postCount || 0,
    likes: apiUser.likeCount || 0,
    level: levelLabel(apiUser.level),
  }
}

// 转换 API post → 前端 post 格式
function adaptPost(apiPost) {
  const coverUrl = apiPost.coverUrl
  const aspect = parseFloat(apiPost.imageAspect) || 1.78
  return {
    id: apiPost.id,
    userId: apiPost.userId,
    category: apiPost.categoryId,
    title: apiPost.title,
    excerpt: apiPost.excerpt || '',
    hasImage: !!coverUrl,
    imageUrl: coverUrl || null,
    imageAspect: aspect,
    imageRatio: aspect >= 1 ? '16:9' : '9:16',
    likes: apiPost.likeCount || 0,
    bookmarks: apiPost.bookmarkCount || 0,
    comments: apiPost.commentCount || 0,
    timeAgo: timeAgo(apiPost.createdAt),
    isHot: (apiPost.hotScore || 0) > 20,
    isElite: apiPost.isElite || false,
    tags: (apiPost.tags || []).map(pt => pt.tag?.name || pt.name || pt),
    user: apiPost.user ? adaptUser(apiPost.user) : null,
  }
}

// AUTH 状态管理
const AUTH_USER_KEY = 'bbs_current_user'
const TOKEN_KEY = 'bbs_token'

window.AUTH = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  currentUser: JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null'),
  get isLoggedIn() { return !!this.token && !!this.currentUser },

  setSession(user, token) {
    this.token = token
    this.currentUser = adaptUser(user)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser))
  },

  clearSession() {
    this.token = null
    this.currentUser = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

// 主加载函数
async function fetchAndSetAppData() {
  let categories = []
  let posts = []

  try {
    // 并行获取分类和帖子
    const [catRes, postRes] = await Promise.all([
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/posts?sort=hot&limit=50`),
    ])

    if (catRes.ok) {
      const catJson = await catRes.json()
      if (catJson.success && Array.isArray(catJson.data)) {
        categories = catJson.data
      }
    }

    if (postRes.ok) {
      const postJson = await postRes.json()
      const rawPosts = postJson.success
        ? (Array.isArray(postJson.data) ? postJson.data : postJson.data?.posts || [])
        : []
      posts = rawPosts
        .filter(p => !p.status || p.status === 'PUBLISHED' || p.reviewStatus === 'APPROVED')
        .map(adaptPost)
    }
  } catch (err) {
    // 网络或解析失败，fallback 到空数据，不 crash 页面
    console.warn('[api-loader] 数据加载失败，使用空数据', err)
  }

  // 从 posts 的 user 字段提取去重用户列表
  const userMap = new Map()
  posts.forEach(p => {
    if (p.user && !userMap.has(p.user.id)) {
      userMap.set(p.user.id, p.user)
    }
  })
  const users = Array.from(userMap.values())

  window.APP_DATA = {
    users,
    categories,
    posts,
    comments: {},   // 按需加载
    postBodies: {}, // 按需加载
  }
}

// 占位：由 app.jsx 补充具体方法
window.API = window.API || {}

export default fetchAndSetAppData()
