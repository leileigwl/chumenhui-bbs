import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const passwordHash = bcryptjs.hashSync('password123', 12)

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { id: 'all', label: '全部', color: '#C95B15', bg: '#FFF3EC', sort: 0 },
    { id: 'agent', label: 'AI智能体', color: '#7C3AED', bg: '#F5F3FF', sort: 1 },
    { id: 'earning', label: '赚钱实战', color: '#059669', bg: '#ECFDF5', sort: 2 },
    { id: 'camp', label: '训练营', color: '#DC2626', bg: '#FEF2F2', sort: 3 },
    { id: 'talent', label: '人才培养', color: '#2563EB', bg: '#EFF6FF', sort: 4 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { label: cat.label, color: cat.color, bg: cat.bg, sort: cat.sort },
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // ─── Users ────────────────────────────────────────────────────────────────
  const usersData = [
    {
      username: 'zhangweiyuan',
      email: 'admin@chumenhui.com',
      password: passwordHash,
      nickname: '张伟远',
      level: 'ELITE' as const,
      role: 'ADMIN' as const,
      bio: '楚门会创始人，AI创业实战导师，帮助500+学员实现从0到1的AI变现突破。',
      title: '创始人 & AI实战导师',
      postCount: 42,
      likeCount: 1280,
      followerCount: 890,
      followingCount: 35,
    },
    {
      username: 'lishimin',
      email: 'lishimin@example.com',
      password: passwordHash,
      nickname: '李思敏',
      level: 'INTERMEDIATE' as const,
      role: 'USER' as const,
      bio: '产品经理转型AI创业，正在用Claude+Cursor打造SaaS工具，月收入破万中。',
      title: 'AI独立开发者',
      postCount: 18,
      likeCount: 340,
      followerCount: 210,
      followingCount: 88,
    },
    {
      username: 'chenhaoran',
      email: 'chenhaoran@example.com',
      password: passwordHash,
      nickname: '陈浩然',
      level: 'BEGINNER' as const,
      role: 'USER' as const,
      bio: '大学生一枚，在楚门会学习AI工具变现，目前副业月入3000+。',
      title: 'AI学习者',
      postCount: 7,
      likeCount: 89,
      followerCount: 43,
      followingCount: 120,
    },
    {
      username: 'wangxiaofang',
      email: 'wangxiaofang@example.com',
      password: passwordHash,
      nickname: '王晓芳',
      level: 'MENTOR' as const,
      role: 'USER' as const,
      bio: '前字节跳动产品总监，现专注于AI教育赛道，带领团队打造AI训练营产品。',
      title: '资深产品顾问',
      postCount: 56,
      likeCount: 2100,
      followerCount: 1560,
      followingCount: 72,
    },
    {
      username: 'liumingyuan',
      email: 'liumingyuan@example.com',
      password: passwordHash,
      nickname: '刘明远',
      level: 'ELITE' as const,
      role: 'USER' as const,
      bio: '连续创业者，AI工具矩阵运营，月营收50万+，擅长AI内容与流量变现。',
      title: 'AI创业实战家',
      postCount: 33,
      likeCount: 980,
      followerCount: 720,
      followingCount: 58,
    },
  ]

  const createdUsers: { id: number; username: string }[] = []
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        nickname: userData.nickname,
        level: userData.level,
        role: userData.role,
        bio: userData.bio,
        title: userData.title,
      },
      create: userData,
    })
    createdUsers.push({ id: user.id, username: user.username })
  }
  console.log('✅ Users seeded')

  const getUserId = (username: string) => {
    const u = createdUsers.find((u) => u.username === username)
    if (!u) throw new Error(`User not found: ${username}`)
    return u.id
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const tagNames = ['AI工具', '副业变现', '创业实战', 'Prompt技巧', 'Claude', 'Cursor', '训练营', '自动化', '内容创作', '流量运营', '人才培养']

  const createdTags: { id: number; name: string }[] = []
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    createdTags.push({ id: tag.id, name: tag.name })
  }
  console.log('✅ Tags seeded')

  const getTagId = (name: string) => {
    const t = createdTags.find((t) => t.name === name)
    if (!t) throw new Error(`Tag not found: ${name}`)
    return t.id
  }

  // ─── Posts ────────────────────────────────────────────────────────────────
  const postsData = [
    {
      userId: getUserId('zhangweiyuan'),
      categoryId: 'agent',
      title: '我用Claude搭建了一个全自动客服Agent，日处理咨询500+',
      content: `## 背景

去年我花了大量时间手动回复用户咨询，效率极低。今年决定用Claude API搭建一个全自动客服Agent。

## 技术架构

核心用的是Claude claude-sonnet-4-6 + Function Calling + 知识库检索（RAG）。

整体流程：
1. 用户发起咨询
2. Agent先检索知识库，判断是否有现成答案
3. 有答案直接回复；没有则调用人工介入工具
4. 所有对话记录入库，定期分析改进知识库

## 效果数据

- 自动解决率：78%
- 平均响应时间：< 3秒（之前人工需要2-4小时）
- 每月节省人工成本约8000元

## 代码核心

\`\`\`python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_knowledge_base",
        "description": "搜索知识库获取相关答案",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"}
            },
            "required": ["query"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": user_query}]
)
\`\`\`

大家有问题欢迎评论区交流！`,
      excerpt: '用Claude API搭建全自动客服Agent，日处理咨询500+，自动解决率78%，月节省成本8000元。',
      isElite: true,
      likeCount: 234,
      bookmarkCount: 89,
      commentCount: 47,
      viewCount: 3200,
      hotScore: 9.2,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['AI工具', 'Claude', '自动化'],
    },
    {
      userId: getUserId('wangxiaofang'),
      categoryId: 'camp',
      title: '楚门会第三期训练营复盘：28天帮助学员月入过万的核心方法论',
      content: `## 训练营背景

第三期训练营刚刚结束，这里做一个完整复盘，希望对大家有参考价值。

## 核心数据

- 参与学员：47人
- 结营后月入过万：19人（40%）
- 最高月收入：6.8万（AI绘图接单）
- 平均月收入增长：+4200元

## 核心方法论：AI变现三步法

### 第一步：找准赛道（第1-7天）

不是所有AI应用都能变现。我们筛选了几个高确定性赛道：
- AI绘图（Midjourney/Stable Diffusion）→ 接单平台
- AI写作 → 内容外包
- AI编程 → 外包项目
- AI短视频 → 账号矩阵

### 第二步：快速出单（第8-21天）

找赛道只是第一步，更关键的是快速拿到第一单。我们的方法：
1. 先做免费案例，积累作品集
2. 在垂直平台发布，不在通用平台卷
3. 用AI辅助定价，不低价内卷

### 第三步：系统化复制（第22-28天）

有了第一单之后，如何规模化？

答案是：SOP + AI工具链 = 效率10倍提升

## 下期训练营预告

第四期将于下月开营，欢迎私信了解。`,
      excerpt: '第三期训练营复盘：47名学员，40%月入过万，分享AI变现三步法核心方法论。',
      isElite: true,
      likeCount: 189,
      bookmarkCount: 134,
      commentCount: 62,
      viewCount: 4800,
      hotScore: 9.5,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['训练营', '副业变现', '创业实战'],
    },
    {
      userId: getUserId('liumingyuan'),
      categoryId: 'earning',
      title: '分享我用AI内容矩阵月入50万的完整操盘路径',
      content: `## 先说结论

AI内容矩阵不是什么新鲜玩意，但真正做到月入50万的人极少。核心差异在执行细节。

## 我的矩阵规模

- 抖音账号：12个垂直账号
- 小红书账号：8个
- 视频号：5个
- 公众号：3个

## 核心工具链

内容生产：Claude（脚本） + Runway（视频） + ElevenLabs（配音）
分发管理：自研分发系统（Python + API）
数据分析：飞书多维表格 + 自定义脚本

## 变现路径

1. 广告接单（占收入60%）
2. 知识付费（占30%）
3. 私域转化（占10%）

## 最关键的一个认知

AI工具只是杠杆，内容本身的价值才是核心。很多人买了一堆AI工具，但内容还是垃圾，那就没用。

先搞清楚"什么内容对目标用户有价值"，再用AI放大生产效率。`,
      excerpt: 'AI内容矩阵月入50万操盘路径分享：12+账号矩阵、完整工具链、三条变现路径详解。',
      isElite: false,
      likeCount: 312,
      bookmarkCount: 167,
      commentCount: 88,
      viewCount: 6700,
      hotScore: 9.8,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['副业变现', '内容创作', '流量运营'],
    },
    {
      userId: getUserId('lishimin'),
      categoryId: 'agent',
      title: 'Cursor实战：我用它10天独立开发了一个SaaS工具，已有30个付费用户',
      content: `## 项目背景

我是产品经理出身，不会写代码。今年3月开始学Cursor，10天做出了第一个SaaS产品。

## 产品是什么

一个面向小团队的AI会议纪要工具：
- 上传会议录音/视频
- AI自动生成结构化纪要
- 支持导出Word/飞书文档
- 定价：59元/月

## Cursor使用心得

### 正确的姿势

1. 先用Claude设计整体架构，输出技术文档
2. 再用Cursor逐模块实现
3. 遇到Bug，截图给Claude分析，再回Cursor修改

### 踩过的坑

- 上下文太长会让Cursor犯糊涂，要学会拆分任务
- 不要让AI一次性写完所有代码，分模块来
- 测试很重要，AI写的代码有时候看起来对但实际有问题

## 当前数据

- 上线时间：2个月
- 付费用户：34个
- 月收入：2006元
- 下个目标：100个付费用户

还在成长阶段，欢迎大家来试用并给我反馈！`,
      excerpt: '产品经理用Cursor 10天独立开发SaaS工具，2个月34个付费用户，详解完整开发流程。',
      isElite: false,
      likeCount: 145,
      bookmarkCount: 78,
      commentCount: 39,
      viewCount: 2900,
      hotScore: 7.8,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['Cursor', 'AI工具', '创业实战'],
    },
    {
      userId: getUserId('zhangweiyuan'),
      categoryId: 'talent',
      title: '如何系统性地学习Prompt Engineering：我总结的完整学习路线图',
      content: `## 为什么要学Prompt Engineering

很多人觉得"提示词"随便写写就行，但真正做过复杂AI应用的人都知道：好的Prompt是产品质量的核心。

## 学习路线图

### 阶段一：基础概念（1-2周）

- 理解LLM的工作原理（不需要深入，但要有基本认知）
- 了解常见的Prompt模式：Few-shot、Chain-of-thought、Role-playing
- 实践工具：Claude.ai / ChatGPT

### 阶段二：进阶技巧（2-4周）

重点学习：
1. **结构化输出**：让AI输出JSON、Markdown等格式
2. **约束控制**：如何让AI不跑题、不幻觉
3. **长上下文管理**：处理大文档的技巧

### 阶段三：工程化（1-2个月）

- Prompt版本管理
- A/B测试不同Prompt的效果
- 构建Prompt评估体系

## 推荐资源

1. Anthropic官方Prompt指南（必读）
2. 《构建AI应用》（我写的小册，论坛内可下载）
3. 每天用Claude做10个实际任务（最有效的练习方式）

## 最后

Prompt Engineering不是玄学，是工程。系统学，系统练，3个月内可以达到较高水平。`,
      excerpt: '系统性学习Prompt Engineering完整路线图：从基础概念到工程化，3个月达到较高水平。',
      isElite: false,
      likeCount: 267,
      bookmarkCount: 198,
      commentCount: 54,
      viewCount: 5100,
      hotScore: 8.9,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['Prompt技巧', 'AI工具', '人才培养'],
    },
    {
      userId: getUserId('chenhaoran'),
      categoryId: 'earning',
      title: '大学生副业分享：靠AI绘图接单，上个月收入3800元',
      content: `## 自我介绍

大三学生，学的是市场营销，完全没有美术基础。去年10月开始学Midjourney，现在靠接单月入3000-4000。

## 接单平台

主要在这几个平台接单：
- 猪八戒（最多单，但竞争激烈）
- 站酷（品质客户多，单价高）
- 微信私域（老客户介绍，最稳定）

## 我的定价策略

- Logo设计：300-800元/个
- 品牌VI基础套件：1500-3000元/套
- 插画定制：200-500元/张
- 头像定制：50-150元/个

## 最近的一单案例

上周接了一个餐厅的品牌设计，需要logo + 菜单封面 + 店招。

用Midjourney生成初稿，Adobe Firefly细化，最后Photoshop处理细节。

整个项目2天完成，收费1800元。

## 给同学们的建议

1. 先做免费案例，不要急着接付费单
2. 找准细分赛道，别什么都接
3. 学会沟通，理解客户需求比技术更重要
4. AI是工具，审美和沟通能力才是核心竞争力`,
      excerpt: '大学生靠AI绘图副业月入3800元，分享接单平台选择、定价策略和真实案例。',
      isElite: false,
      likeCount: 98,
      bookmarkCount: 56,
      commentCount: 31,
      viewCount: 1800,
      hotScore: 6.5,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['副业变现', 'AI工具'],
    },
    {
      userId: getUserId('wangxiaofang'),
      categoryId: 'talent',
      title: '为什么你学了很多AI工具却没有变现？根本原因在这里',
      content: `## 一个真实的现象

我接触了几千个AI学习者，发现一个共同问题：

买了很多AI课程，学了很多AI工具，但就是赚不到钱。

为什么？

## 根本原因：工具思维 vs 产品思维

大多数人学AI是"工具思维"：

> 我要学会用Midjourney → 学会了 → 然后呢？

真正能变现的人是"产品思维"：

> 我的目标用户是谁？他们有什么痛点？AI能帮我更高效地解决他们的问题吗？

## 三个核心转变

### 1. 从"学工具"到"解决问题"

不要问"Cursor能做什么"，要问"我要帮什么人解决什么问题，Cursor能帮助我吗"。

### 2. 从"生产内容"到"创造价值"

AI写的内容不等于有价值的内容。你需要加入自己的洞察、经验、判断。

### 3. 从"自嗨"到"市场验证"

很多人做了产品但没人买，根本原因是没有做市场验证。

建议：在开始做之前，先找10个潜在用户聊，确认他们愿意付钱再动手。

## 实操建议

1. 先找1个具体的目标用户群体
2. 深度访谈5-10个潜在用户
3. 找到他们最痛的1个问题
4. 用AI工具最快速地提供解决方案
5. 定价测试`,
      excerpt: '为什么学了很多AI工具却没变现？关键在于从"工具思维"转变为"产品思维"，深度解析三个核心转变。',
      isElite: false,
      likeCount: 445,
      bookmarkCount: 289,
      commentCount: 93,
      viewCount: 8900,
      hotScore: 9.7,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['创业实战', '副业变现'],
    },
    {
      userId: getUserId('liumingyuan'),
      categoryId: 'agent',
      title: '实战：用n8n + Claude搭建全自动选题-写作-发布工作流',
      content: `## 工作流概述

我用n8n搭建了一条全自动内容生产流水线：

**选题 → 大纲 → 写作 → 配图 → 审核 → 发布**

全程基本不需要人工干预，每天自动产出5-8篇内容。

## 关键节点设计

### 节点1：选题发现

数据源：
- RSS订阅（科技媒体热文）
- 微博热搜API
- 知乎热榜爬虫

用Claude做选题评分：价值性、时效性、差异性三个维度，自动筛选高分选题。

### 节点2：内容生产

提示词设计是核心，我用了"角色扮演 + 结构化输出 + 质量约束"的组合：

\`\`\`
你是一位专注AI领域的资深科技作者，风格：深度、实用、有观点。

请基于以下选题生成一篇2000字左右的文章：
{topic}

输出格式（JSON）：
{
  "title": "标题",
  "outline": ["段落1", "段落2"...],
  "content": "正文",
  "tags": ["标签1", "标签2"]
}

质量要求：
- 必须包含具体案例或数据
- 避免空洞的AI术语堆砌
- 结论要有明确的行动建议
\`\`\`

### 节点3：质量审核

还是用Claude做审核，重点检查：事实准确性、逻辑连贯性、是否有价值。

低于70分的内容自动进人工审核队列。

## 效果数据

- 日均产出内容：6.3篇
- 人工干预率：约12%
- 内容质量（读者评分）：4.1/5

具体n8n配置文件可以私信我要。`,
      excerpt: '用n8n + Claude搭建全自动内容工作流，从选题到发布全程自动化，日均产出6篇高质量内容。',
      isElite: false,
      likeCount: 178,
      bookmarkCount: 112,
      commentCount: 45,
      viewCount: 3400,
      hotScore: 8.1,
      reviewStatus: 'APPROVED' as const,
      status: 'PUBLISHED' as const,
      tags: ['自动化', 'Claude', 'AI工具'],
    },
  ]

  for (const postData of postsData) {
    const { tags, ...postFields } = postData

    // Check if post already exists by title + userId
    const existing = await prisma.post.findFirst({
      where: { title: postFields.title, userId: postFields.userId },
    })

    if (existing) {
      console.log(`  ⏭️  Post already exists: ${postFields.title.slice(0, 30)}...`)
      continue
    }

    const post = await prisma.post.create({
      data: {
        ...postFields,
        tags: {
          create: tags.map((tagName) => ({
            tag: { connect: { id: getTagId(tagName) } },
          })),
        },
      },
    })

    console.log(`  📝 Created post: ${post.title.slice(0, 40)}...`)
  }

  console.log('✅ Posts seeded')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
