# CORS 问题修复说明

## 问题描述

在访问 Clawnch API (`https://clawn.ch/api/tokens`) 时遇到 CORS（跨域资源共享）错误：

```
Access to fetch at 'https://clawn.ch/api/tokens' from origin 'http://localhost:5174' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

## 解决方案

通过 Vite 开发服务器的代理功能来解决 CORS 问题。

### 1. 配置 Vite 代理

在 `vite.config.ts` 中添加 Clawnch API 代理：

```typescript
server: {
  proxy: {
    '/api/clawnch': {
      target: 'https://clawn.ch',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/clawnch/, '/api'),
      secure: true,
    },
  },
}
```

### 2. 更新 API 调用

将所有直接调用 `https://clawn.ch/api/*` 的地方改为使用代理路径 `/api/clawnch/*`：

#### ClawnchTokens.tsx
```typescript
// 之前
const response = await fetch('https://clawn.ch/api/tokens')

// 之后
const response = await fetch('/api/clawnch/tokens')
```

#### ClawnchLaunch.tsx
```typescript
// 图片上传
const response = await fetch('/api/clawnch/upload', {...})

// 代币发行
const response = await fetch('/api/clawnch/launch', {...})
```

## 工作原理

1. 前端代码请求 `/api/clawnch/tokens`
2. Vite 开发服务器拦截此请求
3. 将路径重写为 `/api/tokens`
4. 转发到 `https://clawn.ch/api/tokens`
5. 将响应返回给前端

由于请求是从开发服务器发出的（服务器端），不会触发浏览器的 CORS 限制。

## 注意事项

### 开发环境
✅ 使用代理路径：`/api/clawnch/*`
✅ 自动处理 CORS

### 生产环境
在生产环境中，你需要：
1. 让 Clawnch 服务器添加 CORS 头
2. 或者使用服务器端代理
3. 或者部署在同一域名下

## 测试

重启开发服务器后访问：
- http://localhost:5173/clawnch/tokens

应该能正常加载代币列表，不再出现 CORS 错误。

## 已修复的文件

- ✅ `vite.config.ts` - 添加代理配置
- ✅ `ClawnchTokens.tsx` - 更新获取 tokens API
- ✅ `ClawnchLaunch.tsx` - 更新上传和发行 API

## 开发服务器

服务器已重启在：http://localhost:5173/
