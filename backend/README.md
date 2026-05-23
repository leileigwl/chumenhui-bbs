# Backend README

这是楚门会 BBS 的后端服务，提供认证、帖子、评论、互动、上传等 API。

## 技术栈

- Fastify
- TypeScript
- Prisma
- PostgreSQL
- JWT

## 目录结构

```text
backend/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ lib/
│  ├─ middleware/
│  ├─ plugins/
│  ├─ routes/
│  ├─ services/
│  ├─ app.ts
│  └─ server.ts
├─ docker-compose.yml
├─ package.json
└─ .env.example
```

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动数据库

```bash
docker compose up -d
```

### 3. 配置环境变量

```bash
copy .env.example .env
```

### 4. 初始化 Prisma

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. 启动服务

```bash
npm run dev
```

或：

```bash
npm run build
npm run start
```

## 默认配置

- API 端口：`3001`
- PostgreSQL：`5433`
- 上传目录：`backend/uploads`

## 核心模块

### 认证

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### 帖子

- `GET /api/v1/posts`
- `GET /api/v1/posts/:id`
- `POST /api/v1/posts`
- `POST /api/v1/posts/:id/like`
- `POST /api/v1/posts/:id/bookmark`

### 评论

- `GET /api/v1/posts/:id/comments`
- `POST /api/v1/posts/:id/comments`

### 上传

- `POST /api/v1/upload/image`

## 说明

当前版本已经可以稳定提供基础 API 能力，但 Prisma client 的导入方式带有本地环境兼容处理。  
如果后续要继续正式化，优先建议先整理 Prisma 版本和生成链路。
