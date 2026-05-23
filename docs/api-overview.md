# API 概览

Base URL:

```text
http://localhost:3001/api/v1
```

## Auth

### `POST /auth/register`

请求体：

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser",
  "nickname": "测试用户"
}
```

### `POST /auth/login`

请求体：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### `POST /auth/refresh`

### `POST /auth/logout`

## Categories

### `GET /categories`

## Posts

### `GET /posts`

常见查询参数：

- `sort=hot|latest|elite`
- `page`
- `limit`

### `GET /posts/:id`

### `POST /posts`

需要登录。

请求体：

```json
{
  "title": "帖子标题",
  "content": "<p>帖子正文</p>",
  "categoryId": "agent",
  "tags": ["测试", "AI"],
  "coverUrl": "/uploads/xxx.png",
  "imageAspect": 1.78
}
```

### `POST /posts/:id/like`

### `DELETE /posts/:id/like`

### `POST /posts/:id/bookmark`

### `DELETE /posts/:id/bookmark`

## Comments

### `GET /posts/:id/comments`

### `POST /posts/:id/comments`

需要登录。

请求体：

```json
{
  "content": "评论内容",
  "parentId": 1
}
```

## Upload

### `POST /upload/image`

需要登录。  
字段名必须是 `file`。  
支持：

- jpeg
- png
- webp
- gif

## Users

### `GET /users/:id`

### `PUT /users/me`

### `GET /users/me/bookmarks`

### `POST /users/:id/follow`

### `DELETE /users/:id/follow`

## Notifications

### `GET /notifications`

### `PUT /notifications/read`

## Search

### `GET /search`

## Admin

当前后端已经包含管理相关路由，但本轮重点交付和验证的是基础社区主链路，不建议把管理能力视为已完整验收。
