import type { VercelRequest, VercelResponse } from '@vercel/node'

const TARGET_BASE = 'https://www.moltbook.com/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query
  const pathString = Array.isArray(path) ? path.join('/') : path || ''
  const targetUrl = `${TARGET_BASE}/${pathString}`

  // Forward headers, excluding host
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() !== 'host' && typeof value === 'string') {
      headers[key] = value
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value)
      }
    })

    const data = await response.text()
    res.status(response.status).send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
