# 楚门会 BBS

楚门会 BBS 是一个前后端一体的社区项目，当前已经具备可运行的基础社区能力：

- 用户注册
- 用户登录
- 帖子列表 / 帖子详情
- 发帖
- 评论
- 点赞 / 收藏
- 图片上传

前端基于 React + Vite，后端基于 Fastify + TypeScript + Prisma + PostgreSQL。

## 技术栈

### 前端

- React 18
- Vite 5
- 现有原型迁移结构 `src/legacy/*`

### 后端

- Fastify 4
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt

## 目录结构

```text
chumenhui-bbs/
├─ src/
│  ├─ api/                  前端 API 封装
│  ├─ legacy/               前端原型与业务页面
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ public/                  前端静态资源
├─ backend/
│  ├─ prisma/               Prisma schema 与 seed
│  ├─ src/
│  │  ├─ routes/            路由
│  │  ├─ services/          业务逻辑
│  │  ├─ middleware/        鉴权 / 权限
│  │  ├─ plugins/           Fastify 插件
│  │  ├─ lib/               Prisma / token blacklist / mailer
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ docker-compose.yml
│  ├─ package.json
│  └─ .env.example
├─ uploads/
├─ index.html
└─ README.md
```

## 本地启动

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 启动数据库

项目默认使用 Docker 启动独立 PostgreSQL：

```bash
cd backend
docker compose up -d
```

默认端口：

- PostgreSQL: `5433`

### 4. 配置后端环境变量

复制环境变量模板：

```bash
cd backend
copy .env.example .env
```

默认开发配置关键项：

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://bbs_user:bbs_pass@localhost:5433/bbs_db"
REDIS_URL=redis://localhost:6379
```

说明：

- 当前项目里的 `lib/redis.ts` 实际是内存黑名单实现，不依赖真实 Redis 才能运行。
- `SMTP_*` 仅用于找回密码相关能力，日常本地联调不是必需项。

### 5. 初始化数据库

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 6. 启动后端

开发模式：

```bash
cd backend
npm run dev
```

生产/稳定模式：

```bash
cd backend
npm run build
npm run start
```

默认地址：

```text
http://localhost:3001
```

### 7. 启动前端

```bash
npm run dev
```

默认地址：

```text
http://localhost:5173
```

## 当前已实现功能

### 用户体系

- 邮箱注册
- 邮箱密码登录
- Access Token / Refresh Token
- 登出

### 内容能力

- 分类列表
- 帖子列表
- 帖子详情
- 创建帖子
- 评论列表
- 发布评论

### 互动能力

- 点赞帖子
- 收藏帖子
- 评论点赞
- 用户关注

### 上传能力

- 登录态图片上传
- 返回 `/uploads/...` 访问路径

## 开发说明

### 前端

前端当前不是完全重写的新架构，而是在原型基础上接入真实 API：

- `src/legacy/runtime.jsx` 负责按顺序加载原型模块
- `src/legacy/api-loader.js` 负责启动时拉取真实分类与帖子数据
- `src/api/client.js` 负责 token 和基础请求封装
- `src/api/services.js` 负责各业务接口调用

### 后端

后端主入口：

- `backend/src/app.ts`
- `backend/src/server.ts`

核心路由：

- `backend/src/routes/auth.ts`
- `backend/src/routes/posts.ts`
- `backend/src/routes/comments.ts`
- `backend/src/routes/upload.ts`
- `backend/src/routes/users.ts`

### Prisma 说明

当前仓库里的 `backend/src/lib/prisma.ts` 使用的是已生成的 Prisma Client 产物路径。  
这是为了兼容当前本地环境下旧版本 Prisma Client 的生成异常而保留的运行方式。

如果后续要做正式整理，建议：

1. 升级 `prisma` 与 `@prisma/client`
2. 恢复标准导入方式
3. 重新验证 `npm run dev` / `npm run build` / `npm run start`

## 文档索引

- [项目结构说明](./project-structure.md)
- [后端说明](./backend/README.md)
- [开发与运行说明](./docs/development.md)
- [API 概览](./docs/api-overview.md)

## 当前状态说明

当前仓库已经从“纯前端展示版”推进到“前后端联通版”。  
如果继续往生产化走，建议下一阶段重点处理：

- Prisma 版本与导入方式标准化
- 后端启动流程进一步收敛
- 通知 / 管理后台 / 搜索等模块补全验证
- 更完整的错误处理和接口测试
