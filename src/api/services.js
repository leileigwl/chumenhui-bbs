import { get, post, put, del, setToken, clearToken } from './client.js';

// 认证
export const authAPI = {
  register(email, password, username, nickname) {
    return post('/auth/register', { email, password, username, nickname });
  },
  async login(email, password) {
    const data = await post('/auth/login', { email, password });
    if (data?.accessToken) {
      setToken(data.accessToken);
    }
    return data;
  },
  logout() {
    clearToken();
    return post('/auth/logout');
  },
};

// 分类
export const categoriesAPI = {
  list() {
    return get('/categories');
  },
};

// 帖子
export const postsAPI = {
  list(params = {}) {
    const query = new URLSearchParams();
    if (params.sort) query.set('sort', params.sort);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/posts${qs ? `?${qs}` : ''}`);
  },
  hot() {
    return get('/posts/hot');
  },
  getById(id) {
    return get(`/posts/${id}`);
  },
  create(data) {
    return post('/posts', data);
  },
  like(id) {
    return post(`/posts/${id}/like`);
  },
  unlike(id) {
    return del(`/posts/${id}/like`);
  },
  bookmark(id) {
    return post(`/posts/${id}/bookmark`);
  },
  unbookmark(id) {
    return del(`/posts/${id}/bookmark`);
  },
};

// 评论
export const commentsAPI = {
  list(postId, params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/posts/${postId}/comments${qs ? `?${qs}` : ''}`);
  },
  create(postId, content, parentId) {
    const body = { content };
    if (parentId !== undefined && parentId !== null) {
      body.parentId = parentId;
    }
    return post(`/posts/${postId}/comments`, body);
  },
  like(commentId) {
    return post(`/comments/${commentId}/like`);
  },
  delete(commentId) {
    return del(`/comments/${commentId}`);
  },
};

// 用户
export const usersAPI = {
  getById(id) {
    return get(`/users/${id}`);
  },
  updateMe(data) {
    return put('/users/me', data);
  },
  myBookmarks(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/users/me/bookmarks${qs ? `?${qs}` : ''}`);
  },
  follow(id) {
    return post(`/users/${id}/follow`);
  },
  unfollow(id) {
    return del(`/users/${id}/follow`);
  },
};

// 通知
export const notificationsAPI = {
  list(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/notifications/${qs ? `?${qs}` : ''}`);
  },
  markRead() {
    return put('/notifications/read');
  },
};

// 搜索
export const searchAPI = {
  search(q, type, page, limit) {
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (type) query.set('type', type);
    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);
    const qs = query.toString();
    return get(`/search/${qs ? `?${qs}` : ''}`);
  },
};

// 管理后台
export const adminAPI = {
  posts(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/admin/posts${qs ? `?${qs}` : ''}`);
  },
  approvePost(id) {
    return put(`/admin/posts/${id}/approve`);
  },
  rejectPost(id) {
    return put(`/admin/posts/${id}/reject`);
  },
  deletePost(id) {
    return del(`/admin/posts/${id}`);
  },
  toggleElite(id) {
    return put(`/admin/posts/${id}/elite`);
  },
  users(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return get(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  banUser(id) {
    return put(`/admin/users/${id}/ban`);
  },
  unbanUser(id) {
    return put(`/admin/users/${id}/unban`);
  },
};
