# 楚门会 BBS 项目结构说明

## 项目定位

当前项目已经不是纯前端静态展示版，而是：

- 前端可运行
- 后端可运行
- 数据库可初始化
- 注册 / 登录 / 发帖 / 评论主链路已打通

## 目录结构

```text
chumenhui-bbs/
├─ src/
│  ├─ api/
│  │  ├─ client.js
│  │  └─ services.js
│  ├─ data/
│  │  └─ mockData.js
│  ├─ legacy/
│  │  ├─ api-loader.js
│  │  ├─ app.jsx
│  │  ├─ components.jsx
│  │  ├─ data.js
│  │  ├─ features.jsx
│  │  ├─ runtime.jsx
│  │  ├─ settings.jsx
│  │  └─ tweaks-panel.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ public/
├─ uploads/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src/
│  │  ├─ lib/
│  │  ├─ middleware/
│  │  ├─ plugins/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ docker-compose.yml
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ .env.example
├─ docs/
│  ├─ api-overview.md
│  └─ development.md
├─ index.html
├─ package.json
├─ README.md
└─ project-structure.md
```

## 前端结构说明

### `src/legacy/`

这里仍然承载当前前端主业务页面，属于原型迁移延续结构，不是完全组件化重写。

关键文件：

- `runtime.jsx`
  负责按顺序加载原型模块
- `api-loader.js`
  启动时从真实后端拉分类与帖子
- `app.jsx`
  主界面、帖子详情、发布页、登录弹层等核心逻辑

### `src/api/`

- `client.js`
  请求封装、token 管理
- `services.js`
  按业务维度组织接口调用

## 后端结构说明

### `backend/prisma/`

- `schema.prisma`
  数据模型定义
- `seed.ts`
  初始化分类、用户、标签、帖子数据

### `backend/src/routes/`

核心路由包括：

- `auth.ts`
- `posts.ts`
- `comments.ts`
- `upload.ts`
- `users.ts`
- `notifications.ts`
- `search.ts`
- `admin.ts`

### `backend/src/services/`

核心业务层包括：

- `auth.service.ts`
- `post.service.ts`
- `comment.service.ts`
- `interaction.service.ts`
- `user.service.ts`
- `sanitize.service.ts`

### `backend/src/lib/`

- `prisma.ts`
  Prisma Client 接入
- `redis.ts`
  当前实际是 token blacklist 的内存实现
- `mailer.ts`
  邮件发送能力

## 当前需要注意的技术债

### Prisma

当前仓库为了先保证项目能跑通，保留了兼容性处理。  
这意味着项目现在可以运行，但 Prisma 生成与导入方式后续仍建议做标准化整理。

### 前端架构

前端当前是“原型迁移 + API 接入”的形态，短期适合继续推进功能，长期如果要产品化，建议逐步把 `legacy` 结构拆成更清晰的模块。

## 文档建议阅读顺序

1. `README.md`
2. `docs/development.md`
3. `docs/api-overview.md`
4. `backend/README.md`
