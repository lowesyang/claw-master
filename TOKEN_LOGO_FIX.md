# Token Logo 显示问题修复

## 问题描述

在 Clawnch Tokens 页面，代币的 logo 图片无法正常显示，只显示黑色方块。

## 可能的原因

1. **图片 URL 失效或无法访问**
2. **CORS 跨域问题** - 图片服务器不允许跨域访问
3. **图片格式不支持**
4. **网络加载失败**

## 修复方案

### 1. 改进图片显示逻辑

```typescript
// 添加了更好的 fallback 机制
<div style={{
  background: 'linear-gradient(...)', // 紫色渐变背景
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {token.image ? (
    <>
      <img 
        src={token.image}
        crossOrigin="anonymous"  // 尝试处理 CORS
        onLoad={...}  // 图片加载成功时隐藏 fallback
        onError={...} // 图片加载失败时显示 fallback
      />
      <span>🪙</span> {/* Fallback emoji */}
    </>
  ) : (
    <span>🪙</span>
  )}
</div>
```

### 2. 添加调试信息

在每个 token 下方显示实际的图片 URL，方便调试：

```typescript
{token.image && (
  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
    🖼️ Image: {token.image}
  </div>
)}
```

### 3. 改进样式

- 使用紫色渐变背景替代纯色
- 添加边框使 fallback 图标更明显
- 使用更大的 emoji (2.5rem)

## 检查步骤

### 1. 查看图片 URL
刷新 `/clawnch/tokens` 页面，查看每个 token 下方显示的图片 URL：
- URL 是否有效？
- 能否在浏览器中直接访问？

### 2. 检查浏览器控制台
打开浏览器开发者工具（F12），查看 Console：
- 是否有 CORS 错误？
- 是否有 404 或其他网络错误？

### 3. 测试图片 URL
复制显示的图片 URL，在新标签页中打开：
- 图片是否能正常加载？
- 是否提示 CORS 错误？

## 可能的解决方案

### 方案 A: 使用代理（如果是 CORS 问题）

在 `vite.config.ts` 中添加图片代理：

```typescript
'/api/clawnch-images': {
  target: 'https://iili.io',  // 或其他图片域名
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/clawnch-images/, ''),
}
```

### 方案 B: 使用 Base64 图片

在发行代币时，将图片转为 Base64 存储在数据库中。

### 方案 C: 自建图片服务

上传图片到自己的服务器，确保 CORS 配置正确。

## 当前状态

✅ 添加了渐变背景的 fallback 图标
✅ 显示图片 URL 用于调试
✅ 添加了 crossOrigin 属性
✅ 改进了错误处理
✅ 图片加载失败时优雅降级到 🪙 emoji

## 下一步

1. 刷新页面查看图片 URL
2. 测试这些 URL 是否可以直接访问
3. 根据具体错误信息决定使用哪个解决方案

## 示例

如果图片 URL 是 `https://iili.io/xxxxx.jpg`：
1. 在浏览器中直接访问此 URL
2. 如果能看到图片 → CORS 问题，需要代理
3. 如果 404 → 图片已删除，需要重新上传
4. 如果其他错误 → 根据具体情况处理
