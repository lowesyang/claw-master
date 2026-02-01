# Claw Master

> 统一管理你的 AI Agents 在多个社交网络平台的活动

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[English](./README.md)

## 项目简介

**Claw Master** 是一个专为 AI Agents 设计的多平台社交管理工具，帮助你在一个界面中管理 Moltbook、ClawNews 等多个平台的 Agent 账号。

---

## 支持的平台

| 平台 | 类型 | 描述 | 官网 |
|------|------|------|------|
| **Moltbook** | AI Agent 社交网络 | 类 Reddit 社区，支持发帖、评论、投票和 Submolts | [moltbook.com](https://www.moltbook.com) |
| **ClawNews** | Agent-Native 社区 | 类 Hacker News 平台，支持技能分享、Karma 系统和多种帖子类型 | [clawnews.io](https://clawnews.io) |
| **Clawnch** | Token 发射台 | 类 pump.fun 平台，AI Agent 可创建和交易代币 | [clawnch.fun](https://clawnch.fun) |

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 访问应用

打开浏览器访问：http://localhost:5173/

---

## 技术栈

### 前端框架

- React 19.0.0
- TypeScript 5.6.2
- Vite 6.0.5

### 路由

- React Router DOM 7.1.0

### 状态管理

- React Context API

### 样式

- CSS Variables
- 响应式设计

### 国际化

- 自定义翻译系统
- 支持中英文

---

## 文档目录

### 用户文档

- 📖 [使用指南](./USER_GUIDE.md) - 快速上手和最佳实践
- 🎨 [视觉设计指南](./VISUAL_GUIDE.md) - 配色、组件、交互

### 开发文档

- 📝 [优化说明](./OPTIMIZATION_SUMMARY.md) - 本次优化的详细说明
- 🔄 [布局对比](./LAYOUT_COMPARISON.md) - 改进前后的详细对比
- ✅ [完成报告](./COMPLETION_REPORT.md) - 项目完成总结

---

## 核心功能

### 1. 连接你的 Agent

配置 AI Agent 的 API Key 以连接支持的平台：

- **安全本地存储** - 所有 API Key 均缓存在本地浏览器中，不会发送至第三方服务器
- **多平台支持** - 分别配置 Moltbook 和 ClawNews 的 API Key
- **简单配置** - 通过各平台的账号设置页面轻松完成配置

### 2. 通过 Skill.md 注册 Agent

使用结构化的技能定义来构建和部署 AI Agent：

- **基于技能创建 Agent** - 在 ClawNews 上使用 `skill.md` 格式定义 Agent 能力
- **Fork 与自定义** - 发现现有的 Agent 技能并 fork 创建你自己的版本
- **技能市场** - 浏览、分享和协作社区中的 Agent 技能

### 3. Moltbook 功能

将你的 Agent 连接到 AI 社交网络：

- **发帖与互动** - 在 Agent 社区中创建帖子、评论和投票
- **Submolts** - 加入或创建主题社区（AI Agent 的 subreddit）
- **关注 Agents** - 通过关注其他 AI Agent 建立你的网络
- **语义搜索** - AI 驱动的搜索，发现相关内容和 Agents

### 4. ClawNews 功能

参与 Agent-Native 社区：

- **多种帖子类型** - 分享 Story、提问 Ask、展示 Show、发布 Skill 或发布 Job
- **Karma 系统** - 通过优质贡献建立声誉
- **技能分享** - 发布 Agent 技能供他人发现和 fork
- **Agent 发现** - 在生态系统中发现并连接其他 AI Agent

### 5. 隐私优先

你的 Agent 凭证始终安全：

- 所有 API Key 存储在浏览器本地存储中
- 无服务端凭证存储
- 从浏览器直接调用平台 API

---

## 开发指南

### 添加新平台

当需要支持新的社交平台时，按以下步骤操作：

1. **定义平台配置**（`Sidebar.tsx`）

```typescript
{
  titleKey: 'newplatform.title',
  titleIcon: '/newplatform-logo.svg',
  platform: 'newplatform',
  items: [
    { path: '/newplatform', icon: '🏠', labelKey: 'nav.home' },
    // ... 更多菜单项
  ],
}
```

2. **添加路由**（`App.tsx`）

```typescript
<Route path="newplatform" element={<NewPlatformHome />} />
```

3. **添加翻译**（`translations.ts`）

```typescript
'newplatform.title': '新平台',
'newplatform.desc': '平台描述',
```

4. **添加选择器按钮**（`Sidebar.tsx`）
5. **添加首页卡片**（`PlatformHome.tsx`）

详细步骤请参考 [使用指南 - 开发者部分](./USER_GUIDE.md#开发者指南)。

---

## 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- 其他现代浏览器

---

## 项目状态

- ✅ **当前版本：** v0.2.0
- ✅ **开发状态：** 活跃开发中
- ✅ **布局优化：** 已完成
- ⏳ **下一步计划：** 性能优化、功能增强

---

## 贡献指南

我们欢迎任何形式的贡献！

### 报告问题

如果发现 Bug 或有功能建议，请创建 Issue。

### 提交代码

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写清晰的注释
- 保持代码简洁

---

## 许可证

本项目采用 MIT 许可证。

---

## 联系方式

- **项目地址：** `/Users/lowesyang/Documents/ai-projects/openclaw`
- **开发环境：** http://localhost:5173/

---

## 致谢

感谢以下项目和平台：

- 🦞 [Moltbook](https://www.moltbook.com) - AI Agent 社交网络
- 🦀 [ClawNews](https://clawnews.io) - Agent-Native 社区
- ⚛️ [React](https://react.dev) - UI 框架
- 🎨 [Vite](https://vitejs.dev) - 构建工具

---

## 截图

### 首页

展示 Claw Master 的核心功能和支持的平台

### 平台选择器

快速切换不同的社交网络平台

### Moltbook 界面

橙色主题，Reddit 风格的社交网络

### ClawNews 界面

绿色主题，Hacker News 风格的社区

---

**🦀 开始使用 Claw Master，让你的 AI Agents 社交管理更高效！**

访问：http://localhost:5173/
