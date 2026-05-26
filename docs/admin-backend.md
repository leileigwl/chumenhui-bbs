# 管理员后台 — 现状与开发计划

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.1（整合版） |
| 撰写时间 | 2026-05-26 |
| 涉及代码库 | `D:\Projects\chumenhui-bbs` |
| 适用分支 | `main` |
| 文档范围 | 管理员后台 Web 端的开发计划（仅 V1） |
| 阅读对象 | 前端开发、后端开发、产品负责人、技术评审专家 |

> 本文档由 `admin-backend-status.md`（现状）与 `admin-backend-plan.md`（开发计划）整合而成。整合后已统一术语、消除歧义、补齐前置假设与验证依据。
>
> **术语约定**：下文出现的"后台 / 管理后台 / Admin 后台"均指**面向管理员的 Web 操作界面**（位于 `/admin/*` 路径）；"前端 / C 端"指现有的论坛用户界面（位于 `/` 路径）；"后端"指 `backend/` 目录下的 Fastify 服务。

---

## 第一部分 · 现状记录

### 1.1 一句话结论

**当前项目的管理员能力，后端接口与数据模型已完整就绪，但不存在任何可点击的后台 Web 界面。** 管理员目前只能通过 curl / Postman 等工具直接调用 HTTP 接口完成操作，不具备作为产品交付的形态。

### 1.2 现状逐项核对

下表中"代码位置"列均经过实际文件确认，专家可点击校验：

| 层级 | 现状 | 代码位置（已核实） | 是否就绪 |
| --- | --- | --- | --- |
| 数据模型 | 已定义 `UserRole.ADMIN`、`Post.reviewStatus (PENDING/APPROVED/REJECTED)`、`Post.status (DELETED)`、`Post.isElite`、`User.isBanned` | `backend/prisma/schema.prisma` 第 61-67、106-113 行 | ✅ 就绪 |
| 种子数据 | 管理员账号 `admin@chumenhui.com / password123`，`role = 'ADMIN'` | `backend/prisma/seed.ts` 第 32-44 行 | ✅ 就绪 |
| 鉴权中间件 | `requireAdmin`：校验 `request.user.role === 'ADMIN'`，否则返回 HTTP 403 `AUTH_FORBIDDEN` | `backend/src/middleware/admin.middleware.ts` | ✅ 就绪 |
| 后端路由 | 已挂载于 `/api/v1/admin`，共 8 个接口（帖子 5 个 + 用户 3 个） | `backend/src/routes/admin.ts`、`backend/src/app.ts:132` | ✅ 就绪 |
| 登录响应 | `POST /api/v1/auth/login` 返回的 `data.user` 中**已包含 `role` 字段** | `backend/src/routes/auth.ts` 第 76-115 行 `safeUser()` | ✅ 就绪 |
| JWT 负载 | accessToken / refreshToken 内嵌 `role` 字段 | `backend/src/services/auth.service.ts` 第 45-57 行 | ✅ 就绪 |
| 前端接口封装 | `adminAPI` 已封装全部 8 个方法 | `src/api/services.js` 第 137-171 行 | ✅ 就绪 |
| 前端 HTTP 客户端 | `client.js` 自动注入 Bearer Token，401 时清除 token | `src/api/client.js` | ✅ 就绪 |
| **前端后台界面** | **不存在**：无路由、无菜单、无页面 | `src/App.jsx` 为空文件；`src/main.jsx` 仅加载 `legacy/runtime.jsx` | ❌ 缺失 |
| **路由系统** | **不存在**：项目未引入任何路由库，C 端用 `useState('screen')` 切屏 | `package.json` `dependencies` 仅 `react` / `react-dom` | ❌ 缺失 |
| 前端身份透传 | `adaptUser()` 丢弃 `role` 字段，导致前端拿不到管理员身份 | `src/legacy/api-loader.js` 第 26-36 行，无 `role` 赋值 | ⚠️ 有 Bug |

### 1.3 已就绪的后端能力清单

以下 8 个接口已经实现、已挂载、已通过 `requireAdmin` 鉴权，**本期无需改动后端**：

| # | 方法 | 路径 | 用途 |
| --- | --- | --- | --- |
| 1 | GET | `/api/v1/admin/posts` | 按状态分页查询帖子 |
| 2 | PUT | `/api/v1/admin/posts/:id/approve` | 帖子审核通过 |
| 3 | PUT | `/api/v1/admin/posts/:id/reject` | 帖子审核驳回 |
| 4 | DELETE | `/api/v1/admin/posts/:id` | 软删除帖子（置 `status=DELETED`） |
| 5 | PUT | `/api/v1/admin/posts/:id/elite` | 精华标记切换（toggle） |
| 6 | GET | `/api/v1/admin/users` | 按封禁状态分页查询用户 |
| 7 | PUT | `/api/v1/admin/users/:id/ban` | 封禁用户 |
| 8 | PUT | `/api/v1/admin/users/:id/unban` | 解封用户 |

### 1.4 缺失部分

缺失的全部是**前端可视化操作层**，具体包括：

1. 后台路由（如 `/admin`、`/admin/posts`、`/admin/users`）。
2. 后台布局壳（左侧菜单、顶部 Header、退出登录）。
3. 后台首页 / 数据总览（Dashboard）。
4. 帖子审核列表页（按状态筛选、通过 / 驳回 / 删除 / 精华切换）。
5. 用户管理列表页（按封禁状态筛选、封禁 / 解封）。
6. 非管理员访问后台的拦截与 403 兜底页。
7. 管理员后台独立登录入口。

### 1.5 问题判定

> **问题本质不是"接口不存在"，而是"后台 Web 界面尚未落地"。**
> 管理员能力当前只能以接口形式存在，不能作为完整的后台产品交付给运营人员使用。

---

## 第二部分 · 开发计划

### 2.1 目标与非目标

#### 2.1.1 目标（V1 必须交付）

1. 管理员登录后，可通过浏览器访问 `http://<host>/admin` 进入独立后台。
2. 后台拥有统一的左侧菜单 + 顶部 Header 布局壳。
3. 后台包含以下 5 个可用页面：
   - 后台独立登录页（`/admin/login`）
   - 数据总览 / 仪表盘（`/admin/dashboard`）
   - 帖子审核列表（`/admin/posts`）
   - 用户管理列表（`/admin/users`）
   - 权限不足 / 兜底页（`/admin/403`）
4. 所有页面接入第 1.3 节列出的真实接口，**不使用 mock 数据**。
5. 非管理员（含未登录）访问 `/admin/*` 路径时，前端必须拦截并跳转到 `/admin/login` 或 `/admin/403`。
6. 不破坏现有 C 端论坛（位于 `/` 路径）的任何功能。

#### 2.1.2 非目标（V1 不做，列为 V2 候选）

- 操作审计日志（谁在何时审核 / 封禁了谁）
- 评论管理、分类管理、Tag 管理
- 数据可视化图表（仪表盘仅做数字卡片，不做曲线 / 饼图）
- 富文本编辑器
- 后台移动端适配（V1 仅支持桌面端，最小宽度 1280px）
- 多级管理员角色（V1 仅区分 `ADMIN` 与非 `ADMIN`）
- 国际化（V1 仅中文）

### 2.2 技术方案

#### 2.2.1 路由方案

引入 `react-router-dom@^6.26.0`，**仅 1 个新增依赖**。其他备选方案的对比与决策：

| 方案 | 决策 | 决策依据 |
| --- | --- | --- |
| `react-router-dom@6` | ✅ 采用 | 社区主流、URL 可分享、可书签、支持 query 参数 |
| 沿用 `useState('screen')` | ❌ 否决 | URL 无法书签、刷新丢状态、不利于运营沉淀工作流 |
| 手撸 Hash Router | ❌ 否决 | 维护成本高、易踩坑、对协作不友好 |

#### 2.2.2 入口分流策略

- **C 端**（保持不动）：`/` 路径继续加载 `src/legacy/runtime.jsx`。
- **B 端**（新增）：`/admin/*` 路径加载新的 `src/admin/main.jsx`。
- 分流实现：改造 `src/main.jsx`，按 `window.location.pathname` 动态 `import()`，互不干扰。

  ```js
  // src/main.jsx（改造后示意）
  import './styles.css';

  if (window.location.pathname.startsWith('/admin')) {
    import('./admin/main.jsx');
  } else {
    import('./legacy/runtime.jsx');
  }
  ```

  此设计保证**legacy 代码零修改、C 端零回归风险**。

#### 2.2.3 目录结构（新增）

```
src/
├── admin/                              ← 新增，本期所有后台代码都在这里
│   ├── main.jsx                        ← 后台入口，挂载 AdminApp 到 #root
│   ├── AdminApp.jsx                    ← BrowserRouter + 路由配置 + 鉴权壳
│   ├── layout/
│   │   ├── AdminLayout.jsx             ← 左菜单 + 顶部 Header + <Outlet/>
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── pages/
│   │   ├── AdminLogin.jsx              ← /admin/login
│   │   ├── Dashboard.jsx               ← /admin/dashboard
│   │   ├── PostReview.jsx              ← /admin/posts
│   │   ├── UserManagement.jsx          ← /admin/users
│   │   └── Forbidden.jsx               ← /admin/403
│   ├── components/
│   │   ├── DataTable.jsx               ← 通用表格（columns 配置 + 行操作槽）
│   │   ├── StatusBadge.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── PageHeader.jsx
│   ├── hooks/
│   │   ├── useAdminAuth.js             ← 鉴权守卫
│   │   └── usePagedQuery.js            ← 分页查询封装
│   └── styles/
│       └── admin.css                   ← 后台专用样式
├── api/                                ← 已存在，复用，无需修改
│   ├── client.js
│   └── services.js
└── legacy/                             ← 保留，本期完全不动
```

#### 2.2.4 依赖增量

`package.json` `dependencies` 仅新增一行：

```json
"react-router-dom": "^6.26.0"
```

不引入 UI 组件库（Antd / MUI / Chakra）。所有样式手写到 `src/admin/styles/admin.css`，保持与 C 端同色系（主题色 `#C95B15`）。

#### 2.2.5 鉴权流程

```
用户访问 /admin/*  （除 /admin/login 外）
    │
    ▼
useAdminAuth Hook：读取 localStorage 中的 bbs_token 与 bbs_current_user
    │
    ├── 未登录（无 token 或无 user） ─────► 重定向到 /admin/login
    │
    ├── 已登录但 user.role !== 'ADMIN' ──► 重定向到 /admin/403
    │
    └── 已登录且 user.role === 'ADMIN' ──► 渲染目标页
```

> ⚠️ 安全说明：前端鉴权**仅作 UX 友好性拦截**，真正的安全边界由后端 `requireAdmin` 中间件保证。前端永远不能作为最终安全屏障。

### 2.3 阶段拆解与可验证交付物

每阶段都有明确的"完成定义（Definition of Done）"，必须满足全部 DoD 才算阶段完成。

---

#### 阶段 0 · 前置修复（预计 0.5 人日）

**目标**：解除前端拿不到管理员身份的 bug，安装新增依赖。

| # | 任务 | 涉及文件 | 验证方式 |
| --- | --- | --- | --- |
| 0.1 | `adaptUser()` 中增加 `role: apiUser.role` 字段透传 | `src/legacy/api-loader.js:26-36` | 浏览器 Console 执行 `window.AUTH.currentUser.role`，管理员账号返回 `"ADMIN"`，普通账号返回 `"USER"` |
| 0.2 | 安装 `react-router-dom@^6.26.0` | `package.json` | `npm i` 成功；`node_modules/react-router-dom/package.json` 存在；`npm ls react-router-dom` 输出版本号 |

> **说明（消除歧义）**：后端 `/auth/login` 已经返回 `role` 字段（见 `backend/src/routes/auth.ts` 中 `safeUser()` 第 105 行），**后端无需任何改动**。本阶段唯一的代码改动是前端 `adaptUser` 漏字段。

**DoD（阶段完成定义）**：
- ✅ 用 `admin@chumenhui.com / password123` 登录后，`window.AUTH.currentUser.role === 'ADMIN'`。
- ✅ `package.json` 中存在 `react-router-dom` 依赖且 `npm run dev` 启动不报错。
- ✅ C 端论坛页面（`/`）行为无回归。

---

#### 阶段 1 · 路由壳与登录页（预计 1.0 人日）

**目标**：搭出后台外壳，能登录进入空白工作台。

| # | 任务 | 输出 / 涉及文件 | 验证方式 |
| --- | --- | --- | --- |
| 1.1 | 改造 `src/main.jsx`，按路径分流加载 | `src/main.jsx` | 访问 `http://localhost:5173/admin` 进入新代码分支；访问 `/` 仍是旧论坛 |
| 1.2 | 创建 `src/admin/main.jsx`，挂载 `AdminApp` 到 `#root` | 新增文件 | `/admin` 路径渲染出可见内容（哪怕是占位文案）|
| 1.3 | 创建 `AdminApp.jsx`，使用 `BrowserRouter` 注册以下 6 条路由：`/admin`（重定向到 `dashboard`）、`/admin/login`、`/admin/dashboard`、`/admin/posts`、`/admin/users`、`/admin/403` | `src/admin/AdminApp.jsx` | 地址栏依次访问 6 条路径，均不报错（页面内容可以是占位）|
| 1.4 | 实现 `useAdminAuth` Hook | `src/admin/hooks/useAdminAuth.js` | 未登录访问 `/admin/dashboard` 自动跳到 `/admin/login`；普通用户登录后访问 `/admin/dashboard` 自动跳到 `/admin/403` |
| 1.5 | 实现 `AdminLogin.jsx`，复用 `authAPI.login` | `src/admin/pages/AdminLogin.jsx` | 用 `admin@chumenhui.com / password123` 登录成功后跳转到 `/admin/dashboard`；密码错误时显示红色错误文案 |
| 1.6 | 实现 `Forbidden.jsx`，文案 "您不是管理员，无权访问此页面"，并提供"返回首页"按钮 | `src/admin/pages/Forbidden.jsx` | 用 `lishimin@example.com / password123` 登录后访问 `/admin/posts` 应跳 `/admin/403` |
| 1.7 | 实现 `AdminLayout`（Sidebar + TopBar + `<Outlet/>`） | `src/admin/layout/*.jsx` | 左侧菜单显示三项：仪表盘 / 帖子审核 / 用户管理；顶部显示当前管理员昵称 + 退出按钮 |

**DoD（阶段完成定义）**：
- ✅ 管理员账号能登录并看到带菜单的空白工作台。
- ✅ 4 条菜单 / 路由（dashboard / posts / users / login）均可通过菜单点击或 URL 直接跳转。
- ✅ 未登录、非管理员的访问均被前端正确拦截。
- ✅ C 端 `/` 路径功能无回归。

---

#### 阶段 2 · 帖子审核页（预计 1.5 人日）

**目标**：实现核心业务页 — 帖子审核。

##### 2.2.1 页面布局

```
┌──────────────────────────────────────────────────────────────┐
│ PageHeader：帖子审核                                            │
├──────────────────────────────────────────────────────────────┤
│ Tabs：[待审核 (N)]  [已通过]  [已驳回]  [全部]                  │
├──────────────────────────────────────────────────────────────┤
│ DataTable：                                                    │
│ ┌────┬────────┬────────┬──────┬──────────┬──────────────────┐│
│ │ ID │ 标题   │ 作者   │ 分类 │ 提交时间 │ 操作              ││
│ ├────┼────────┼────────┼──────┼──────────┼──────────────────┤│
│ │ .. │ ...    │ ...    │ ...  │ ...      │ 通过 / 驳回 / 删除 / 精华 ││
│ └────┴────────┴────────┴──────┴──────────┴──────────────────┘│
├──────────────────────────────────────────────────────────────┤
│ Pagination：每页 20 条，可切页                                  │
└──────────────────────────────────────────────────────────────┘
```

##### 2.2.2 任务列表

| # | 任务 | 调用接口 | 验证方式 |
| --- | --- | --- | --- |
| 2.1 | `usePagedQuery` Hook：封装分页 + 加载 / 错误 / 空态 | — | 切页能重新拉数据；切 Tab 时重置到第 1 页 |
| 2.2 | `DataTable.jsx`：通用表格（columns 配置 + 行操作槽 + 空态文案） | — | 同一组件后续可复用于用户管理页 |
| 2.3 | `PostReview.jsx`：列表 + 4 个 Tab | `adminAPI.posts({status, page, limit})` | 切 Tab 调用接口、URL `?status=xxx&page=N` 同步更新；浏览器前进后退能恢复 |
| 2.4 | "通过"按钮 + 二次确认弹窗 | `adminAPI.approvePost(id)` | 操作成功后该行从"待审核"Tab 消失；切到"已通过"Tab 可见 |
| 2.5 | "驳回"按钮 + 二次确认弹窗 | `adminAPI.rejectPost(id)` | 同上，切到"已驳回"Tab 可见 |
| 2.6 | "删除"按钮 + **红色**二次确认弹窗 | `adminAPI.deletePost(id)` | 操作成功后该行从任何 Tab 都不再出现（已 `status=DELETED`）|
| 2.7 | "精华"切换按钮 | `adminAPI.toggleElite(id)` | 行内徽章状态翻转，无需弹窗 |
| 2.8 | 点击标题预览：弹层显示 `title` + `content` + `coverUrl` | 复用 `GET /api/v1/posts/:id` | 弹层 ESC 或点遮罩可关闭 |
| 2.9 | 接口错误处理：4xx / 5xx 显示顶部红色 banner，5 秒后自动消失 | — | 断网状态下页面不白屏，有明确错误提示 |

**DoD（阶段完成定义）**：
- ✅ 管理员可在"待审核"Tab 看到所有 `reviewStatus=PENDING` 的帖子。
- ✅ 通过 / 驳回 / 删除 / 精华切换 4 个操作均能正确调用接口，数据持久化到数据库（重启后端后状态仍在）。
- ✅ 切换 Tab 时 URL 的 `?status=` 参数同步更新；直接访问带参数的 URL 能定位到对应 Tab。

---

#### 阶段 3 · 用户管理页（预计 1.0 人日）

##### 2.3.1 页面布局

```
┌──────────────────────────────────────────────────────────────┐
│ PageHeader：用户管理                                            │
├──────────────────────────────────────────────────────────────┤
│ Tabs：[全部]  [正常]  [已封禁]                                  │
├──────────────────────────────────────────────────────────────┤
│ DataTable：                                                    │
│ ┌────┬──────┬────────┬────────┬──────┬──────┬──────┬────────┐│
│ │ ID │ 头像 │ 用户名 │ 邮箱   │ 等级 │ 角色 │ 状态 │ 操作    ││
│ ├────┼──────┼────────┼────────┼──────┼──────┼──────┼────────┤│
│ │ .. │ ...  │ ...    │ ...    │ ...  │ ...  │ 正常 │ 封禁    ││
│ │ .. │ ...  │ ...    │ ...    │ ...  │ ...  │ 已禁 │ 解封    ││
│ └────┴──────┴────────┴────────┴──────┴──────┴──────┴────────┘│
├──────────────────────────────────────────────────────────────┤
│ Pagination：每页 20 条                                          │
└──────────────────────────────────────────────────────────────┘
```

##### 2.3.2 任务列表

| # | 任务 | 调用接口 | 验证方式 |
| --- | --- | --- | --- |
| 3.1 | `UserManagement.jsx`：复用 `DataTable` + `usePagedQuery` | `adminAPI.users({banned, page, limit})` | 三个 Tab 各自请求一次；URL 同步 `?banned=true\|false` |
| 3.2 | "封禁"按钮 + **红色**二次确认弹窗 | `adminAPI.banUser(id)` | 状态徽章变 "已封禁"，行底色变浅红 |
| 3.3 | "解封"按钮 | `adminAPI.unbanUser(id)` | 状态徽章回到 "正常" |
| 3.4 | 自我保护：禁止封禁当前登录的管理员自身（前端按钮置灰 + hover 提示 "不能对自己执行此操作"） | — | 当前管理员账号对应的行，封禁按钮不可点击 |
| 3.5 | 角色徽章配色：`ADMIN` 紫色，`USER` 灰色 | — | 视觉一致 |

**DoD（阶段完成定义）**：
- ✅ 管理员可封禁 / 解封任意非自身的用户。
- ✅ 被封禁的用户重新登录时，后端 `login` 服务会抛出 `AUTH_USER_BANNED`，前端登录页显示错误（此为已有后端逻辑，无需新写）。
- ✅ 管理员无法对自己执行封禁操作。

---

#### 阶段 4 · 仪表盘（预计 0.5 人日）

##### 2.4.1 页面内容

页面包含 4 张数字卡片 + 1 个"最近 5 条待审核帖子"快捷区。

| 卡片 | 数据来源 | 备注 |
| --- | --- | --- |
| 待审核帖子数 | `adminAPI.posts({status:'pending', limit:1})` → `meta.total` | 数字右侧红色徽章 |
| 总用户数 | `adminAPI.users({limit:1})` → `meta.total` | — |
| 已封禁用户数 | `adminAPI.users({banned:'true', limit:1})` → `meta.total` | — |
| 已通过帖子数 | `adminAPI.posts({status:'approved', limit:1})` → `meta.total` | — |

> **取数防御**：所有 `meta.total` 访问均使用 `meta?.total ?? 0`，避免接口返回结构异常时白屏。

##### 2.4.2 任务列表

| # | 任务 | 验证方式 |
| --- | --- | --- |
| 4.1 | `Dashboard.jsx`：4 张数字卡片 + 加载骨架（灰色占位条，非 Spinner） | 数字与各列表 Tab 的计数一致 |
| 4.2 | "待审核"卡片点击跳转 `/admin/posts?status=pending` | 跳转后帖子审核页正确定位到"待审核"Tab |
| 4.3 | "最近 5 条待审核帖子"区：复用 `adminAPI.posts({status:'pending', limit:5})` | 点击任一条跳转 `/admin/posts?status=pending` |

**DoD（阶段完成定义）**：
- ✅ 管理员登录后默认看到仪表盘。
- ✅ 4 个数字与对应列表 Tab 完全一致。
- ✅ 点击卡片 / 快捷区能正确跳转。

---

#### 阶段 5 · 体验打磨与回归（预计 0.5 人日）

| # | 任务 | 验证方式 |
| --- | --- | --- |
| 5.1 | 全局 loading 骨架（灰条占位，不用 Spinner） | 慢网络（Chrome DevTools "Slow 3G"）下不出现"白屏闪烁" |
| 5.2 | 全局空态文案（"暂无待审核帖子"等） | 清空数据库对应记录后，页面不崩 |
| 5.3 | 退出登录：清 `bbs_token` + `bbs_current_user` + 跳 `/admin/login` | `localStorage` 中两个 key 都被清除 |
| 5.4 | C 端回归测试：访问 `/`，验证发帖、点赞、评论、登录 4 大功能 | 无回归 |
| 5.5 | 后端回归测试：`cd backend && npm run build` | 无 TypeScript 编译错误 |
| 5.6 | 前端构建测试：`npm run build` | 无错误；产物总体积增量 < 100KB（react-router-dom 约 18KB gzipped） |
| 5.7 | 浏览器兼容性：在 Chrome / Edge / Firefox 三大主流浏览器最新稳定版验证 | 视觉一致、功能可用 |

**DoD（阶段完成定义）**：第 5.1 至 5.7 全部 ✅。

---

### 2.4 接口契约速查表

实施时无需再翻代码，直接对照本表即可。所有接口均需 `Authorization: Bearer <token>` 且对应用户 `role === 'ADMIN'`，否则返回 HTTP 403 `{ success:false, error:{ code:'AUTH_FORBIDDEN' } }`。

| # | 方法 | 路径 | Query / Body 入参 | 成功响应关键字段 |
| --- | --- | --- | --- | --- |
| 1 | GET | `/api/v1/admin/posts` | `status=pending\|approved\|rejected`（可选）、`page`（默认 1）、`limit`（默认 20，上限 100） | `{ success:true, data: Post[], meta:{ total, page, limit } }` |
| 2 | PUT | `/api/v1/admin/posts/:id/approve` | — | `{ success:true, data: Post }` |
| 3 | PUT | `/api/v1/admin/posts/:id/reject` | — | `{ success:true, data: Post }` |
| 4 | DELETE | `/api/v1/admin/posts/:id` | — | `{ success:true, data:{ message:'帖子已删除' } }` |
| 5 | PUT | `/api/v1/admin/posts/:id/elite` | — | `{ success:true, data: Post }`（toggle 语义） |
| 6 | GET | `/api/v1/admin/users` | `banned=true\|false`（可选）、`page`、`limit` | `{ success:true, data: User[], meta:{ total, page, limit } }` |
| 7 | PUT | `/api/v1/admin/users/:id/ban` | — | `{ success:true, data:{ id, username, isBanned:true } }` |
| 8 | PUT | `/api/v1/admin/users/:id/unban` | — | `{ success:true, data:{ id, username, isBanned:false } }` |

### 2.5 风险与对策

| 风险 | 概率 | 影响 | 对策 |
| --- | --- | --- | --- |
| 引入 `react-router-dom` 破坏 legacy 论坛 | 中 | 高 | 严格走入口分流方案（第 2.2.2 节），legacy 完全不感知 Router |
| 管理员误删 / 误封 | 高 | 高 | 所有破坏性操作强制二次确认弹窗（删除 / 封禁用红色按钮） |
| 接口 `meta.total` 字段缺失导致仪表盘报错 | 低 | 中 | 取值统一防御：`meta?.total ?? 0` |
| 管理员封禁自己 | 中 | 高 | 阶段 3 任务 3.4：前端按钮置灰 |
| Token 过期后页面卡死 | 中 | 中 | 复用 `client.js` 已有的 401 自动清 token 逻辑，并由 `useAdminAuth` 兜底跳登录 |
| 后端 admin 接口未做 CSRF 防护 | 中 | 中 | 当前用 Bearer Token 而非 Cookie 鉴权，CSRF 不适用；V1 暂不处理 |
| 单页数据量大表格卡顿 | 低 | 低 | 后端已限制 `limit` 上限 100；V1 不做虚拟滚动 |

### 2.6 人力与排期

| 阶段 | 工时 | 累计 |
| --- | --- | --- |
| 阶段 0 · 前置修复 | 0.5 d | 0.5 d |
| 阶段 1 · 路由壳 + 登录 | 1.0 d | 1.5 d |
| 阶段 2 · 帖子审核 | 1.5 d | 3.0 d |
| 阶段 3 · 用户管理 | 1.0 d | 4.0 d |
| 阶段 4 · 仪表盘 | 0.5 d | 4.5 d |
| 阶段 5 · 打磨与回归 | 0.5 d | 5.0 d |
| **合计** | **5.0 人日** | — |

> 由 1 名熟悉 React 的前端独立完成；若需产品 / UI 评审 / UAT 验收，额外预留 0.5 人日。

### 2.7 最终验收清单

交付时由验收人逐项打勾，全部 ✅ 才视为本期完成：

- [ ] 管理员 `admin@chumenhui.com` 登录后能进入 `/admin/dashboard`。
- [ ] 普通用户 `lishimin@example.com` 访问 `/admin/*`（除 login 外）被拦截到 `/admin/403`。
- [ ] 未登录访问 `/admin/*`（除 login 外）被拦截到 `/admin/login`。
- [ ] 仪表盘 4 张数字卡片数值与对应列表 Tab 计数一致。
- [ ] 帖子审核：通过 / 驳回 / 删除 / 精华切换 4 个操作均能正确调用接口并刷新列表。
- [ ] 帖子审核：4 个 Tab 切换正确，URL `?status=` 参数随之变化；浏览器前进后退能恢复。
- [ ] 用户管理：封禁 / 解封 操作生效；被封禁用户重新登录被后端拦截。
- [ ] 用户管理：管理员无法对自己执行封禁。
- [ ] 退出登录后 `bbs_token` 与 `bbs_current_user` 被清除，无法再访问 `/admin/dashboard`。
- [ ] 访问 `/` 旧论坛功能（发帖 / 评论 / 登录 / 收藏）全部正常。
- [ ] Chrome / Edge / Firefox 三大浏览器视觉与功能一致。
- [ ] `npm run build` 通过，产物体积增量 < 100KB。
- [ ] `cd backend && npm run build` 通过。

---

## 第三部分 · 附录

### 3.1 测试账号

| 角色 | 邮箱 | 密码 | 来源 |
| --- | --- | --- | --- |
| 管理员 | `admin@chumenhui.com` | `password123` | `backend/prisma/seed.ts` 第 32-44 行 |
| 普通用户 | `lishimin@example.com` | `password123` | `backend/prisma/seed.ts` 第 45-58 行 |

### 3.2 启动命令速查

```bash
# 后端（默认端口 3001）
cd backend
npm install
npm run dev

# 前端（默认端口 5173）
cd ..
npm install
npm run dev

# 浏览器访问
http://localhost:5173/             # C 端论坛
http://localhost:5173/admin        # B 端后台（V1 开发完成后可用）
```

### 3.3 设计风格约定

- **主题色**：与 C 端保持一致，暖橙色 `#C95B15`。
- **布局风格**：参考 Linear / Notion，简洁、低密度、留白充足。
- **交互原则**：
  - 所有破坏性操作（删除 / 封禁）必须有红色二次确认弹窗。
  - 非破坏性操作（精华切换）可直接生效，无需弹窗。
  - 加载态用灰色骨架条，不用 Spinner。
- **文案**：全中文，避免英文术语；错误文案具体可操作（如"邮箱或密码错误"而非"Login Failed"）。

### 3.4 V2 候选清单（本期不做）

- 操作审计日志（who / when / what / target）
- 评论管理 + 评论举报处理
- 分类与标签 CRUD
- 站点公告 / Banner 配置
- 用户详情抽屉（含其历史发帖、被举报记录）
- 数据图表（DAU / 发帖趋势 / 留存）
- 多级管理员角色（超管 / 审核员 / 运营）
- 后台移动端适配
- 国际化

### 3.5 文档历史

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| v0.1（现状） | 2026-05-26 | `admin-backend-status.md` 初稿 |
| v1.0（计划） | 2026-05-26 | `admin-backend-plan.md` 初稿 |
| **v1.1（本文）** | **2026-05-26** | **整合现状与计划；核实代码引用、修正前端身份透传定位、统一术语、强化每阶段 DoD 与验收清单** |

---

## 第四部分 · 文档自审报告（专家可读性核查）

> 本节用于向技术评审专家说明本文档已经过的歧义消除工作。如有新的歧义点，请在评审时直接指出。

### 4.1 已主动消除的歧义点

| # | 原版本的潜在歧义 | 整合版的明确化处理 |
| --- | --- | --- |
| 1 | "前端有 `adminAPI` 接口封装" — 未指明位置 | 改为"`src/api/services.js` 第 137-171 行"，可直接定位 |
| 2 | "后端已经支持帖子审核 / 用户封禁" — 未列接口路径 | 整理为完整的 8 行接口表（第 1.3 节） |
| 3 | 原计划阶段 0 的"任务 0.2"称需要修改后端 `auth.service.ts` | 经代码核实，后端 `safeUser()` 已返回 `role` 字段，**后端无需改动**；阶段 0 仅需修前端 `adaptUser` |
| 4 | "后台路由" — 未明确路径列表 | 改为明确的 6 条路由（`/admin`、`/admin/login`、`/admin/dashboard`、`/admin/posts`、`/admin/users`、`/admin/403`） |
| 5 | "前端鉴权拦截" — 未说明是否可替代后端鉴权 | 在 2.2.5 节加注："前端仅作 UX 拦截，安全边界以后端 `requireAdmin` 为准" |
| 6 | "接口契约" — 入参 / 出参未列细节 | 增加 2.4 节速查表，含分页默认值、上限、错误码 |
| 7 | "二次确认" — 未明确哪些操作需要 | 明确：删除 / 封禁用**红色**二次确认；精华切换无需确认 |
| 8 | "完成定义"分散在各处 | 每个阶段独立列出 DoD，并汇总成 2.7 节验收清单 |
| 9 | "后台 / 管理后台 / Admin" 等术语混用 | 文档开头统一术语约定 |
| 10 | "C 端不破坏"如何保证 | 第 2.2.2 节给出具体方案：`main.jsx` 按路径分流，legacy 零改动 |

### 4.2 假设与边界

为避免实施时再产生新的歧义，本文档显式声明以下假设：

1. 本期**不涉及后端代码改动**（已就绪）。如评审认为需要补充审计日志，请单独立项。
2. 本期**不涉及数据库 schema 变更**。
3. 本期 UI 由开发独立完成，**不依赖外部设计稿**；如有设计资源加入，可在阶段 5 之前替换样式。
4. 本期**仅支持桌面端**（≥ 1280px）；移动端访问 `/admin` 可显示但不保证体验。
5. 测试账号密码 `password123` 仅用于本地与种子环境；生产部署前必须通过环境变量或手动重置覆盖。

### 4.3 评审人快速复核路径

评审人可按以下顺序快速复核本文档与代码的一致性：

1. 打开 `backend/src/routes/admin.ts`，对照本文档 2.4 节接口表。
2. 打开 `backend/src/routes/auth.ts:76` 看 `safeUser()`，确认 `role` 已返回。
3. 打开 `src/api/services.js:137` 看 `adminAPI`，确认 8 个方法齐全。
4. 打开 `src/legacy/api-loader.js:26` 看 `adaptUser`，确认 `role` 字段确实缺失（阶段 0 待修）。
5. 打开 `src/main.jsx`，确认目前只加载 `legacy/runtime.jsx`，可被阶段 1 任务 1.1 改造。
6. 打开 `package.json`，确认目前无 `react-router-dom` 依赖。
