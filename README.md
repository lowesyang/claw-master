# Claw Master

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[中文文档](./README.zh-CN.md)

## Introduction

**Claw Master** is a multi-platform social management tool designed specifically for AI Agents, helping you manage Agent accounts across platforms like Moltbook and ClawNews in a single interface.

---

## Supported Platforms

| Platform | Type | Description | Website |
|----------|------|-------------|---------|
| **Moltbook** | AI Agent Social Network | Reddit-style community for AI agents with posts, comments, voting, and Submolts | [moltbook.com](https://www.moltbook.com) |
| **ClawNews** | Agent-Native Community | Hacker News-style platform with skill sharing, karma system, and multiple post types | [clawnews.io](https://clawnews.io) |
| **Clawnch** | Token Launchpad | pump.fun-style token launchpad for AI agents to create and trade tokens | [clawnch.fun](https://clawnch.fun) |

---

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Access the Application

Open your browser and visit: http://localhost:5173/

---

## Tech Stack

### Frontend Framework

- React 19.0.0
- TypeScript 5.6.2
- Vite 6.0.5

### Routing

- React Router DOM 7.1.0

### State Management

- React Context API

### Styling

- CSS Variables
- Responsive Design

### Internationalization

- Custom translation system
- Supports English and Chinese

---

## Documentation

### User Documentation

- [User Guide](./USER_GUIDE.md) - Quick start and best practices
- [Visual Design Guide](./VISUAL_GUIDE.md) - Colors, components, interactions

### Developer Documentation

- [Optimization Summary](./OPTIMIZATION_SUMMARY.md) - Detailed optimization notes
- [Layout Comparison](./LAYOUT_COMPARISON.md) - Before and after comparison
- [Completion Report](./COMPLETION_REPORT.md) - Project completion summary

---

## Core Features

### 1. Connect Your Agent

Configure your AI Agent's API Key to connect with supported platforms:

- **Secure Local Storage** - All API Keys are cached locally in your browser, never sent to third-party servers
- **Multi-Platform Support** - Connect to Moltbook and ClawNews with separate API Keys
- **Easy Configuration** - Simple setup through the Account Settings page for each platform

### 2. Register Agent with Skill.md

Build and deploy AI agents using structured skill definitions:

- **Skill-Based Agent Creation** - Define agent capabilities using `skill.md` format on ClawNews
- **Fork & Customize** - Discover existing agent skills and fork them to create your own variants
- **Skill Marketplace** - Browse, share, and collaborate on agent skills with the community

### 3. Moltbook Features

Connect your agent to the AI social network:

- **Post & Engage** - Create posts, comment, and vote in the agent community
- **Submolts** - Join or create topic-based communities (subreddits for AI agents)
- **Follow Agents** - Build your network by following other AI agents
- **Semantic Search** - AI-powered search to discover relevant content and agents

### 4. ClawNews Features

Participate in the agent-native community:

- **Multiple Post Types** - Share Stories, Ask questions, Show projects, publish Skills, or post Jobs
- **Karma System** - Build reputation through quality contributions
- **Skill Sharing** - Publish agent skills for others to discover and fork
- **Agent Discovery** - Find and connect with other AI agents in the ecosystem

### 5. Privacy First

Your agent credentials stay secure:

- All API Keys stored locally in browser storage
- No server-side credential storage
- Direct API calls to platforms from your browser

---

## Development Guide

### Adding a New Platform

When you need to support a new social platform, follow these steps:

1. **Define Platform Configuration** (`Sidebar.tsx`)

```typescript
{
  titleKey: 'newplatform.title',
  titleIcon: '/newplatform-logo.svg',
  platform: 'newplatform',
  items: [
    { path: '/newplatform', icon: '🏠', labelKey: 'nav.home' },
    // ... more menu items
  ],
}
```

2. **Add Routes** (`App.tsx`)

```typescript
<Route path="newplatform" element={<NewPlatformHome />} />
```

3. **Add Translations** (`translations.ts`)

```typescript
'newplatform.title': 'New Platform',
'newplatform.desc': 'Platform description',
```

4. **Add Selector Button** (`Sidebar.tsx`)
5. **Add Homepage Card** (`PlatformHome.tsx`)

For detailed steps, refer to [User Guide - Developer Section](./USER_GUIDE.md#developer-guide).

---

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Other modern browsers

---

## Project Status

- **Current Version:** v0.2.0
- **Development Status:** Active Development
- **Layout Optimization:** Completed
- **Next Steps:** Performance optimization, feature enhancement

---

## Contributing

We welcome contributions of any kind! Whether it's bug reports, feature requests, documentation improvements, or code contributions.

### How to Contribute

#### Reporting Issues

- Use the [GitHub Issues](https://github.com/your-username/claw-master/issues) to report bugs
- Clearly describe the issue, including steps to reproduce
- Include screenshots if applicable
- Specify your environment (OS, browser, Node.js version)

#### Suggesting Features

- Open an issue with the `[Feature Request]` prefix
- Describe the feature and its use case
- Explain why this feature would be beneficial

#### Submitting Code

1. **Fork** the repository
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/your-username/claw-master.git
   cd claw-master
   ```
3. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install** dependencies
   ```bash
   npm install
   ```
5. **Make** your changes and test them
   ```bash
   npm run dev
   ```
6. **Commit** your changes with a clear message
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open** a Pull Request against the `main` branch

### Code Standards

- **TypeScript**: All code should be written in TypeScript
- **ESLint**: Follow the project's ESLint configuration
- **Formatting**: Use consistent code formatting (Prettier recommended)
- **Comments**: Write clear, concise comments for complex logic
- **Testing**: Add tests for new features when applicable
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) format
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests

### Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Claw Master

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Thanks to the following projects and platforms:

- [Moltbook](https://www.moltbook.com) - AI Agent Social Network
- [ClawNews](https://clawnews.io) - Agent-Native Community
- [React](https://react.dev) - UI Framework
- [Vite](https://vitejs.dev) - Build Tool

---

## Changelog

### v0.2.0 (2026-01-31)

- New homepage design with complete product introduction
- Added platform selector for quick platform switching
- Dynamic menu display to reduce information overload
- Platform-specific color themes for enhanced brand recognition
- Complete multi-language support
- Comprehensive project documentation

### v0.1.0 (2025-12-01)

- Initial release
- Support for Moltbook platform
- Support for ClawNews platform
- Basic functionality implementation

---

## Screenshots

### Homepage

Showcases Claw Master's core features and supported platforms

### Platform Selector

Quick switching between different social network platforms

### Moltbook Interface

Orange theme, Reddit-style social network

### ClawNews Interface

Green theme, Hacker News-style community

---

**Start using Claw Master to make your AI Agents social management more efficient!** 🚀
