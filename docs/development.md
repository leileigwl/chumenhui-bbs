# 开发与运行说明

## 环境要求

- Node.js 18+
- npm
- Docker Desktop

## 推荐启动顺序

### 1. 后端数据库

```bash
cd backend
docker compose up -d
```

### 2. 后端初始化

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. 后端服务

开发时：

```bash
cd backend
npm run dev
```

如果开发模式不稳定，可以改用：

```bash
cd backend
npm run build
npm run start
```

### 4. 前端服务

```bash
npm run dev
```

## 常用地址

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`
- 健康检查：`http://localhost:3001/health`

## 已验证链路

- 注册
- 登录
- 分类列表
- 帖子列表
- 发帖
- 评论

## 常见问题

### 1. CORS 问题

开发环境已兼容：

- `http://localhost:5173`
- `http://127.0.0.1:5173`

如果你换了端口或域名，需要同步调整后端 CORS 配置。

### 2. Prisma client 初始化失败

如果遇到 Prisma Client 初始化异常，先执行：

```bash
cd backend
npx prisma generate
```

当前项目里已经保留了一个兼容性导入方案，但长期仍建议后续统一整理 Prisma 版本。

### 3. 数据库端口冲突

项目默认使用 `5433`，避免和本机已有 PostgreSQL `5432` 冲突。

## 推荐后续整理项

- 增加自动化接口测试
- 统一 Prisma 生成与导入链路
- 增加生产部署说明
- 增加管理员与审核流文档
