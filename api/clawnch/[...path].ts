import type { VercelRequest, VercelResponse } from '@vercel/node'

// 代理 Clawnch 公开 API（不含敏感信息的请求）
const TARGET_BASE = 'https://clawn.ch/api'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query
  const pathString = Array.isArray(path) ? path.join('/') : path || ''
  const targetUrl = `${TARGET_BASE}/${pathString}`

  // 构建请求头（不转发敏感头）
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    const data = await response.text()
    res.status(response.status).send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
