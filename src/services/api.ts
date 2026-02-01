// 直接调用 Moltbook API（纯前端调用）
const API_BASE = 'https://www.moltbook.com/api/v1'
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions'

interface ApiError extends Error {
  hint?: string
  apiResponse?: Record<string, unknown>
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (apiKey) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`
  }

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (e) {
    // Network error or CORS blocked
    const error: ApiError = new Error('Network error: Unable to reach Moltbook API. This may be due to CORS restrictions.')
    error.hint = 'The Moltbook API may not support cross-origin requests from browsers.'
    throw error
  }

  const text = await response.text()
  let data: T
  
  try {
    data = JSON.parse(text)
  } catch {
    // Response is not JSON (likely HTML error page)
    const error: ApiError = new Error('Invalid response from Moltbook API')
    error.hint = text.includes('<!DOCTYPE') 
      ? 'Received HTML instead of JSON. The API endpoint may not exist or CORS may be blocking the request.'
      : 'Response was not valid JSON'
    throw error
  }

  if (!response.ok) {
    const error: ApiError = new Error((data as Record<string, string>).error || (data as Record<string, string>).hint || 'Request failed')
    error.hint = (data as Record<string, string>).hint || undefined
    error.apiResponse = data as Record<string, unknown>
    throw error
  }

  return data
}

export async function generateAIContent(
  openrouterApiKey: string,
  model: string,
  topic: string,
  submolt: string
): Promise<string> {
  const systemPrompt = `你是一个 AI Agent，正在 Moltbook（一个专为 AI Agent 设计的社交网络）上发帖。
请根据用户提供的主题生成一篇有趣、有见解的帖子内容。

要求：
- 用中文写作
- 内容简洁有力，2-4 段即可
- 可以分享观点、提问、或讨论
- 保持友好和建设性的语气
- 不要使用 markdown 格式
- 直接输出帖子内容，不要加任何前缀说明`

  const response = await fetch(OPENROUTER_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openrouterApiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Moltbook Publisher',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `社区: ${submolt}\n主题: ${topic}` },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'AI 生成失败')
  }

  const generatedText = data.choices?.[0]?.message?.content
  if (!generatedText) {
    throw new Error('AI 未返回有效内容')
  }

  return generatedText.trim()
}

export async function generateAITitle(
  openrouterApiKey: string,
  model: string,
  content: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openrouterApiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Moltbook Publisher',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: `根据以下内容，生成一个简短吸引人的帖子标题（10-20字，不要标点符号，直接输出标题）：\n\n${content.substring(0, 300)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    }),
  })

  const data = await response.json()
  const generatedTitle = data.choices?.[0]?.message?.content

  if (generatedTitle) {
    return generatedTitle.trim().replace(/["""]/g, '')
  }

  return ''
}
