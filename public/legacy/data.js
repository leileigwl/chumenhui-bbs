(function () {
  const users = [
    { id: 1, name: '张伟远', title: 'AI 产品负责人', followers: 3200, posts: 28, likes: 4820, level: '精英' },
    { id: 2, name: '李思敏', title: '独立创业者',    followers: 1850, posts: 45, likes: 9340, level: '进阶' },
    { id: 3, name: '陈浩然', title: 'AI 工程师',     followers: 920,  posts: 15, likes: 2100, level: '初阶' },
    { id: 4, name: '王晓芳', title: 'AI 培训讲师',   followers: 5600, posts: 67, likes: 21800,level: '导师' },
    { id: 5, name: '刘明远', title: '企业数字化顾问', followers: 2300, posts: 31, likes: 7600, level: '精英' },
  ];

  const categories = [
    { id: 'all',     label: '全部',      color: '#C95B15', bg: '#FEF1E8' },
    { id: 'agent',   label: 'AI 智能体', color: '#2B5CE6', bg: '#EBF0FD' },
    { id: 'earning', label: '赚钱实战',  color: '#1A7A4A', bg: '#E6F5EE' },
    { id: 'camp',    label: '训练营',    color: '#C95B15', bg: '#FEF1E8' },
    { id: 'talent',  label: '人才培养',  color: '#7C3AED', bg: '#F5F3FF' },
    { id: 'claudecode', label: 'ClaudeCode', color: '#5B4FE6', bg: '#F0EFFD' },
    { id: 'codex', label: 'Codex', color: '#0E7490', bg: '#ECFEFF' },
  ];

  const posts = [
    {
      id: 1, userId: 2, category: 'earning',
      title: '3 个月 AI 副业月入 3 万，完整复盘',
      excerpt: '我是全职程序员，利用 Claude API + n8n 搭了自动化接单系统，专接 AI 外包小项目。3 个月做到月均 3 万+，分享完整路径……',
      hasImage: false,
      dataHighlight: { before: '月收益 ¥0', after: '月收益 ¥32,000' },
      likes: 486, bookmarks: 124, comments: 73, timeAgo: '3小时前',
      isHot: true, isElite: false, tags: ['副业', 'Claude', 'n8n'],
    },
    {
      id: 2, userId: 3, category: 'agent',
      title: 'AI 选题智能体上线 2 个月，小红书涨粉 5000',
      excerpt: '三层智能体架构：Claude + Dify + 飞书，每天自动出 10 个爆款选题……',
      hasImage: true, imageAspect: 1.5,
      likes: 321, bookmarks: 98, comments: 44, timeAgo: '5小时前',
      isHot: true, isElite: true, tags: ['智能体', 'Dify', '小红书'],
    },
    {
      id: 3, userId: 3, category: 'camp',
      title: '训练营第 5 周复盘：Prompt 工程的真正核心',
      excerpt: '很多人以为把要求写得越详细越好，但 Prompt 工程的核心其实是帮模型建立正确的"世界观"，而不是堆砌指令……',
      hasImage: false,
      likes: 158, bookmarks: 62, comments: 28, timeAgo: '1天前',
      isHot: false, isElite: true, tags: ['Prompt', '训练营', '方法论'],
    },
    {
      id: 4, userId: 4, category: 'talent',
      title: '帮 20 家企业 AI 落地，踩过的 10 个真实坑',
      excerpt: '80% 的项目失败都有共同的原因。坑一：把 AI 当搜索引擎用；坑二：忽视数据质量……',
      hasImage: true, imageAspect: 1.2,
      likes: 892, bookmarks: 267, comments: 156, timeAgo: '2天前',
      isHot: true, isElite: true, tags: ['企业落地', '避坑', 'AI转型'],
    },
    {
      id: 5, userId: 3, category: 'agent',
      title: '用 Cursor 一周独立开发 SaaS 并上线',
      excerpt: '传统开发至少 3 个月，AI 辅助 7 天完成。分享完整工具链和关键节点……',
      hasImage: true, imageAspect: 1.8,
      dataHighlight: { before: '传统开发 90天', after: 'AI辅助 7天' },
      likes: 653, bookmarks: 189, comments: 88, timeAgo: '3天前',
      isHot: true, isElite: false, tags: ['Cursor', 'SaaS', '独立开发'],
    },
    {
      id: 6, userId: 2, category: 'earning',
      title: 'AI 写作工作流：月产出 200 篇文章',
      excerpt: '从选题、研究、起稿到排版发布全自动化，完整工具链和 SOP 分享……',
      hasImage: false,
      likes: 274, bookmarks: 85, comments: 39, timeAgo: '4天前',
      isHot: false, isElite: false, tags: ['写作', '工作流', '自动化'],
    },
    {
      id: 7, userId: 4, category: 'talent',
      title: '从零到月薪 5 万 AI 工程师路线图',
      excerpt: '不需要科班背景，3–6 个月可达的路径，我带出的 30 位学员亲测有效……',
      hasImage: true, imageAspect: 1.3,
      likes: 1024, bookmarks: 356, comments: 201, timeAgo: '5天前',
      isHot: true, isElite: true, tags: ['AI工程师', '学习路线', '职业发展'],
    },
    {
      id: 8, userId: 5, category: 'agent',
      title: 'Qwen3 本地部署 + RAG 知识库完整教程',
      excerpt: '全程零基础向，环境配置、模型量化、知识库接入、API 封装一条龙，附代码……',
      hasImage: false,
      likes: 437, bookmarks: 143, comments: 67, timeAgo: '1周前',
      isHot: false, isElite: false, tags: ['Qwen3', 'RAG', '本地部署'],
    },
    {
      id: 9, userId: 1, category: 'agent',
      title: '用 Dify 搭建企业知识库问答机器人全教程',
      excerpt: '从零搭建支持 PDF、Word 文档的企业知识库问答机器人，附完整配置步骤和避坑指南……',
      hasImage: true, imageAspect: 1.4,
      likes: 203, bookmarks: 67, comments: 31, timeAgo: '1周前',
      isHot: false, isElite: false, tags: ['Dify', '知识库', '企业'],
    },
    {
      id: 10, userId: 5, category: 'earning',
      title: '接 AI 咨询项目的正确方式，我连续接了 12 个',
      excerpt: '不是在平台等单，而是主动找客户。定位、定价、成交的完整方法论……',
      hasImage: false,
      likes: 318, bookmarks: 94, comments: 52, timeAgo: '1周前',
      isHot: false, isElite: true, tags: ['咨询', '接单', '定价'],
    },
    {
      id: 11, userId: 4, category: 'camp',
      title: '学员用 AI 3 个月变现 15 万，完整复盘',
      excerpt: '7 期训练营学员的实战复盘：从 0 基础到 AI 变现，她走了哪条路……',
      hasImage: true, imageAspect: 1.6,
      dataHighlight: { before: '0 AI基础', after: '3个月变现 15万' },
      likes: 567, bookmarks: 178, comments: 89, timeAgo: '2周前',
      isHot: true, isElite: true, tags: ['训练营', '变现', '学员案例'],
    },
    {
      id: 12, userId: 2, category: 'talent',
      title: 'AI 时代的 T 型人才：技术 × 业务的最优解',
      excerpt: '不需要成为顶尖工程师，但你必须真正理解 AI 的能力边界。分享 AI 人才成长路径……',
      hasImage: false,
      likes: 145, bookmarks: 48, comments: 23, timeAgo: '2周前',
      isHot: false, isElite: false, tags: ['人才', 'T型人才', '成长'],
    },
    {
      id: 13, userId: 1, category: 'claudecode',
      title: 'Claude Code CLI 让我的开发效率提升 3 倍',
      excerpt: '我把重构、测试、文档和 PR 审查都交给 Claude Code CLI，再用 Git 工作流串起来，3 天的活压到 4 小时，分享 5 个高频场景和配置细节。',
      hasImage: true, imageAspect: 16 / 9, imageUrl: '/uploads/pasted-1778730429355-0.png', imageRatio: '16:9',
      likes: 744, bookmarks: 221, comments: 96, timeAgo: '2小时前',
      isHot: true, isElite: false, tags: ['ClaudeCode', 'CLI', '工作流'],
    },
    {
      id: 14, userId: 4, category: 'claudecode',
      title: 'Claude Code 上下文管理的 7 个技巧',
      excerpt: '200k token 不是越满越好。我整理了从 .claudeignore、CLAUDE.md 到模块化 profile 的 7 个技巧，让 Claude 真正理解项目架构。',
      hasImage: false,
      likes: 613, bookmarks: 187, comments: 82, timeAgo: '4小时前',
      isHot: false, isElite: true, tags: ['ClaudeCode', '上下文', '最佳实践'],
    },
    {
      id: 15, userId: 3, category: 'claudecode',
      title: '用 Claude Code 调试生产环境 Bug 的完整流程',
      excerpt: '凌晨 3 点线上支付报警，我让 Claude Code 先读日志再定位代码，20 分钟完成修复、测试和回滚方案，复盘完整流程。',
      hasImage: true, imageAspect: 9 / 16, imageUrl: '/uploads/pasted-1778730484153-0.png', imageRatio: '9:16',
      likes: 980, bookmarks: 304, comments: 126, timeAgo: '6小时前',
      isHot: true, isElite: true, tags: ['ClaudeCode', '调试', '生产环境'],
    },
    {
      id: 16, userId: 5, category: 'codex',
      title: 'Codex 辅助开发：从需求到上线只用 2 天',
      excerpt: '我用 Codex 跑完需求拆解、数据库设计、接口实现和联调，把一个企业工单系统从 0 做到上线，只用了 2 天。',
      hasImage: true, imageAspect: 16 / 9, imageUrl: '/uploads/pasted-1778730404549-0.png', imageRatio: '16:9',
      likes: 538, bookmarks: 176, comments: 64, timeAgo: '3小时前',
      isHot: true, isElite: false, tags: ['Codex', '全栈开发', 'Prompt'],
    },
    {
      id: 17, userId: 4, category: 'codex',
      title: 'Codex 代码审查：发现了 12 个人工漏掉的问题',
      excerpt: '把 Codex 接进 PR 流程后，我在一轮审查里抓出 SQL 注入、内存泄漏和并发竞态等 12 个问题，还顺手补了测试。',
      hasImage: false,
      likes: 872, bookmarks: 245, comments: 118, timeAgo: '1天前',
      isHot: false, isElite: true, tags: ['Codex', 'CodeReview', '代码质量'],
    },
    {
      id: 18, userId: 2, category: 'codex',
      title: '用 Codex 学习新技术栈，1 周掌握 Rust',
      excerpt: '我把 7 天 Rust 学习拆成概念理解、语法练习、小项目和实战，配合 100+ 个 Prompt 模板，第一次把新技术栈啃透。',
      hasImage: true, imageAspect: 9 / 16, imageUrl: '/uploads/pasted-1778730484153-0.png', imageRatio: '9:16',
      likes: 765, bookmarks: 233, comments: 101, timeAgo: '2天前',
      isHot: true, isElite: true, tags: ['Codex', '学习', 'Rust'],
    },
  ];

  const comments = {
    1: [
      {
        id: 1, userId: 3, content: '太实用了！请问接单渠道主要是哪里，闲鱼还是猪八戒？',
        likes: 23, timeAgo: '2小时前',
        replies: [
          { id: 101, userId: 2, content: '@陈浩然 主要是闲鱼，搜「AI外包」「智能问答」最准，猪八戒竞争更激烈', likes: 11, timeAgo: '1小时前' },
        ],
      },
      {
        id: 2, userId: 4, content: '月入3万是税前还是税后？成本方面怎么算的？',
        likes: 18, timeAgo: '1小时前', replies: [],
      },
      {
        id: 3, userId: 5, content: 'Claude成本控制是个关键问题，能分享一下token用量吗？',
        likes: 12, timeAgo: '45分钟前',
        replies: [
          { id: 102, userId: 2, content: '@刘明远 输入控制在2000 tokens以内，输出200左右，每个项目成本30–50元', likes: 5, timeAgo: '30分钟前' },
        ],
      },
      {
        id: 4, userId: 1, content: '和我的路径很像，但我用的是Dify+本地模型，成本更低',
        likes: 9, timeAgo: '30分钟前', replies: [],
      },
    ],
    4: [
      { id: 5, userId: 1, content: '第3个坑说得太准了，我们公司就是这样翻车的。', likes: 45, timeAgo: '1天前', replies: [] },
      {
        id: 6, userId: 2, content: '请问10个坑里哪个最难绕过？有没有通用的解法？',
        likes: 28, timeAgo: '18小时前',
        replies: [
          { id: 103, userId: 4, content: '@李思敏 坑三最难，需要从组织层面推动，技术手段解决不了管理问题', likes: 22, timeAgo: '16小时前' },
        ],
      },
      { id: 7, userId: 3, content: '数据质量这个坑，我们花了3个月才清完，太有共鸣了', likes: 19, timeAgo: '12小时前', replies: [] },
    ],
    2: [
      {
        id: 8, userId: 5, content: '能分享一下Dify的prompt模板吗，我也想搭一个',
        likes: 34, timeAgo: '3小时前',
        replies: [
          { id: 104, userId: 3, content: '@刘明远 私信我，我把模板发你', likes: 18, timeAgo: '2小时前' },
        ],
      },
      { id: 9, userId: 4, content: '涨粉5000的数据是不是有水分？内容质量怎么保证的', likes: 15, timeAgo: '4小时前', replies: [] },
    ],
    13: [
      {
        id: 201, userId: 3, content: '这个流程很实用，尤其是 PR 审查那一步。',
        likes: 21, timeAgo: '1小时前',
        replies: [
          { id: 202, userId: 1, content: '@陈浩然 先让它扫 diff，再人工收口，效率最高。', likes: 9, timeAgo: '45分钟前' },
        ],
      },
      { id: 203, userId: 4, content: '重构 5000 行时，怎么避免它乱改接口？', likes: 18, timeAgo: '50分钟前', replies: [] },
    ],
    14: [
      { id: 204, userId: 2, content: '.claudeignore 这步真的被很多人忽略了。', likes: 27, timeAgo: '3小时前', replies: [] },
      {
        id: 205, userId: 5, content: '模块化 profile 的思路很好，能不能再展开说下？',
        likes: 14, timeAgo: '2小时前',
        replies: [
          { id: 206, userId: 4, content: '@刘明远 我下次单独写一篇，实际效果比堆 token 强很多。', likes: 8, timeAgo: '1小时前' },
        ],
      },
    ],
    15: [
      { id: 207, userId: 5, content: '凌晨 3 点那段太真实了，日志分析确实是第一步。', likes: 35, timeAgo: '5小时前', replies: [] },
      {
        id: 208, userId: 1, content: '修复时你会先打补丁还是先做回滚预案？',
        likes: 16, timeAgo: '4小时前',
        replies: [
          { id: 209, userId: 3, content: '@张伟远 先确保能回滚，再补兼容逻辑。', likes: 11, timeAgo: '3小时前' },
        ],
      },
    ],
    16: [
      { id: 210, userId: 1, content: '这个工单系统的需求拆解方法可以直接抄。', likes: 22, timeAgo: '2小时前', replies: [] },
      {
        id: 211, userId: 3, content: '数据库设计和接口一起推进，确实能少很多返工。',
        likes: 19, timeAgo: '1小时前',
        replies: [
          { id: 212, userId: 5, content: '@陈浩然 对，Codex 最适合这种并行协作。', likes: 7, timeAgo: '40分钟前' },
        ],
      },
    ],
    17: [
      { id: 213, userId: 2, content: '12 个问题有点夸张，但我相信它能抓到不少人工漏项。', likes: 28, timeAgo: '20小时前', replies: [] },
      {
        id: 214, userId: 5, content: 'SQL 注入和并发问题确实最容易被忽略，值得接入。',
        likes: 17, timeAgo: '18小时前',
        replies: [
          { id: 215, userId: 4, content: '@刘明远 先做第一轮机器审查，人工效率会高很多。', likes: 10, timeAgo: '16小时前' },
        ],
      },
    ],
    18: [
      { id: 216, userId: 3, content: '7 天一门语言，这个节奏很适合实战型学习。', likes: 31, timeAgo: '1天前', replies: [] },
      {
        id: 217, userId: 4, content: '100+ 个 Prompt 模板是怎么整理出来的？',
        likes: 20, timeAgo: '22小时前',
        replies: [
          { id: 218, userId: 2, content: '@王晓芳 先按概念分类，再按练习类型归档。', likes: 12, timeAgo: '20小时前' },
        ],
      },
    ],
  };

  const postBodies = {
    1: [
      { type: 'p', text: '我是一名全职程序员，工作之余用 Claude API + n8n 搭了一套自动化接单系统，专接 AI 外包小项目。' },
      { type: 'h2', text: '核心思路' },
      { type: 'p', text: '专接一类项目：企业内部的「智能问答机器人」。客户提供文档，我负责接入、部署、调试，收费 3000–8000 元/个。门槛不高，但需求旺盛。' },
      { type: 'h2', text: '获客渠道' },
      { type: 'list', items: ['闲鱼：关键词「AI客服机器人」「企业知识库」', '朋友圈：发了2条案例就带来了3个客户', '老客户介绍：第一个项目做好，自然有转介绍'] },
      { type: 'h2', text: '工具链' },
      { type: 'p', text: 'Claude API（理解+生成）→ n8n（流程自动化）→ 飞书/企微（客户交付）。整套搭建成本不超过 500 元/月。' },
      { type: 'h2', text: '收益复盘' },
      { type: 'list', items: ['第1个月：3个项目 ¥8,000', '第2个月：6个项目 ¥22,000', '第3个月：8个项目 ¥32,000'] },
      { type: 'p', text: '目前在考虑把它做成 SaaS，感兴趣的可以评论区交流。' },
    ],
    4: [
      { type: 'p', text: '帮超过 20 家企业做 AI 落地后，我发现 80% 的失败案例都有共同原因。今天把这 10 个坑完整整理出来。' },
      { type: 'h2', text: '坑一：把 AI 当搜索引擎' },
      { type: 'p', text: '让所有员工「问 AI 什么都回答」，结果大量幻觉问题，员工反而不信任。正确做法：限定场景，建立清晰的知识边界。' },
      { type: 'h2', text: '坑二：忽视数据质量' },
      { type: 'p', text: '把公司所有文档一股脑丢进知识库，结果一团糟。要先做数据治理，再做 AI 接入。' },
      { type: 'h2', text: '坑三：没有配套培训' },
      { type: 'p', text: '系统上线但没人会用，半年后悄悄弃用。工具上线必须匹配完整的培训 SOP 和激励机制。' },
      { type: 'h2', text: '坑四：不会算 ROI' },
      { type: 'p', text: '说不清楚 AI 到底省了多少钱，第二年预算就被砍。要从一开始就设定可量化的指标，按月汇报。' },
      { type: 'p', text: '后面还有 6 个坑，欢迎评论区交流你们遇到的情况。' },
    ],
    13: [
      { type: 'p', text: '我不是把 Claude Code 当聊天工具，而是直接放进日常开发流。' },
      { type: 'h2', text: '5 个高频场景' },
      { type: 'list', items: ['代码重构', '单元测试生成', 'API 文档编写', '代码审查', 'Bug 修复'] },
      { type: 'h2', text: '配置方式' },
      { type: 'p', text: '我给它准备了常用 Prompt 模板、项目级配置和 Git hooks，让它每次都在同一套规则下工作。' },
      { type: 'h2', text: '结果' },
      { type: 'p', text: '一个 5000 行遗留模块，传统方式要 3 天，我用 Claude Code 4 小时就完成了重构、测试和文档。' },
    ],
    14: [
      { type: 'p', text: '上下文不是越多越好，关键是让 Claude 看到最有价值的那部分。' },
      { type: 'h2', text: '我常用的 7 个做法' },
      { type: 'list', items: ['用 .claudeignore 排除无关文件', '写清 CLAUDE.md', '分阶段给上下文', '用 Artifact 保存决策', '主动压缩长对话', '按模块拆分', '利用缓存批量处理'] },
      { type: 'h2', text: '效果' },
      { type: 'p', text: '上下文从 180k token 压到 40k 左右后，响应更快，回答也更聚焦。' },
    ],
    15: [
      { type: 'p', text: '凌晨 3 点报警后，我先把日志丢给 Claude Code 读，再去看代码。' },
      { type: 'h2', text: '完整流程' },
      { type: 'list', items: ['分析错误日志', '定位问题代码', '生成兼容修复', '补单元测试', '准备回滚和监控'] },
      { type: 'h2', text: '关键点' },
      { type: 'p', text: '生产环境修复最重要的是兼容旧数据、保留回滚路径，并且把测试一起补上。' },
    ],
    16: [
      { type: 'p', text: '这次我把 Codex 放进完整的全栈开发流程里，从需求拆解一路做到上线。' },
      { type: 'h2', text: '推进顺序' },
      { type: 'list', items: ['先读业务说明', '再做数据库设计', '同步定义接口', '最后生成前端和测试'] },
      { type: 'h2', text: '最有用的 Prompt' },
      { type: 'p', text: '不是一句“帮我写代码”，而是明确边界：保持现有风格、不乱加依赖、先出方案再出代码。' },
      { type: 'h2', text: '结果' },
      { type: 'p', text: '原本预估 5 天的工单系统，最终 2 天上线。' },
    ],
    17: [
      { type: 'p', text: '我把 Codex 接进 PR 审查流程后，它先负责扫一轮全量变更，我再做人工确认。' },
      { type: 'h2', text: '重点审查项' },
      { type: 'list', items: ['代码规范', '逻辑正确性', '性能问题', '安全漏洞', '可维护性'] },
      { type: 'h2', text: '典型发现' },
      { type: 'p', text: '这次它抓出了 SQL 拼接、并发竞态和一个高并发下会放大的内存泄漏。' },
    ],
    18: [
      { type: 'p', text: '我把 Rust 学习拆成 7 天，每天只解决一个主题，再让 Codex 帮我做理解和练习。' },
      { type: 'h2', text: '7 天节奏' },
      { type: 'list', items: ['所有权和借用', '变量和类型', '错误处理', 'trait 和泛型', '模块结构', '异步编程', '小项目实战'] },
      { type: 'h2', text: 'Codex 的用法' },
      { type: 'p', text: '我让它解释概念、改写示例、出练习题，再帮我检查逻辑漏洞，而不是直接给最终答案。' },
      { type: 'h2', text: '结果' },
      { type: 'p', text: '1 周后我能独立写一个基础 Rust CLI，也更知道怎么继续自学。' },
    ],
  };

  window.APP_DATA = { users, categories, posts, comments, postBodies };
})();
