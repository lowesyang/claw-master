// 直接调用 Moltbook API（纯前端调用）
import { OpenRouter } from '@openrouter/sdk'
import { PLATFORM_SKILLS } from '../types'

const API_BASE = 'https://www.moltbook.com/api/v1'

// Cache for skill content per platform
const skillContentCache: Record<string, { content: string; timestamp: number }> = {}
const SKILL_CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Fetch and cache the skill.md content for a platform
 * Used to provide agents with platform-specific instructions in their system prompt
 * @param platform - Platform name ('moltbook' | 'clawnews')
 * @returns The skill.md content as a string
 */
export async function fetchSkillContent(platform: 'moltbook' | 'clawnews' = 'moltbook'): Promise<string> {
  const skillUrl = PLATFORM_SKILLS[platform]?.skillUrl
  if (!skillUrl) {
    throw new Error(`No skill URL configured for platform: ${platform}`)
  }
  
  const now = Date.now()
  const cached = skillContentCache[platform]
  
  // Return cached content if still valid
  if (cached && (now - cached.timestamp) < SKILL_CACHE_DURATION) {
    return cached.content
  }
  
  try {
    const response = await fetch(skillUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch skill.md: ${response.status}`)
    }
    const content = await response.text()
    
    // Update cache
    skillContentCache[platform] = { content, timestamp: now }
    return content
  } catch (error) {
    console.error(`Failed to fetch skill content for ${platform}:`, error)
    // Return cached content if available, even if expired
    if (cached) {
      return cached.content
    }
    throw error
  }
}

// Migrate legacy/invalid OpenRouter model IDs to current valid ones
const MODEL_ID_MIGRATION: Record<string, string> = {
  'google/gemini-3-flash': 'google/gemini-3-flash-preview',
  'google/gemini-3-pro': 'google/gemini-3-pro-preview',
}

function resolveModelId(model: string): string {
  return MODEL_ID_MIGRATION[model] || model
}

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
    ; (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`
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
  if (response.ok && !text.trim()) {
    return {} as T
  }
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

/** Follow an agent. POST /agents/:name/follow */
export async function followAgent(name: string, apiKey: string): Promise<void> {
  await apiRequest(`/agents/${encodeURIComponent(name)}/follow`, { method: 'POST' }, apiKey)
}

/** Unfollow an agent. DELETE /agents/:name/follow */
export async function unfollowAgent(name: string, apiKey: string): Promise<void> {
  await apiRequest(`/agents/${encodeURIComponent(name)}/follow`, { method: 'DELETE' }, apiKey)
}

/** Subscribe to a submolt. POST /submolts/:name/subscribe */
export async function subscribeSubmolt(name: string, apiKey: string): Promise<void> {
  await apiRequest(`/submolts/${encodeURIComponent(name)}/subscribe`, { method: 'POST' }, apiKey)
}

/** Unsubscribe from a submolt. DELETE /submolts/:name/subscribe */
export async function unsubscribeSubmolt(name: string, apiKey: string): Promise<void> {
  await apiRequest(`/submolts/${encodeURIComponent(name)}/subscribe`, { method: 'DELETE' }, apiKey)
}

/** Upvote a post. POST /posts/:id/upvote */
export async function upvotePost(postId: string, apiKey: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(postId)}/upvote`, { method: 'POST' }, apiKey)
}

/** Remove upvote from a post. DELETE /posts/:id/upvote */
export async function removeUpvote(postId: string, apiKey: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(postId)}/upvote`, { method: 'DELETE' }, apiKey)
}

/** Downvote a post. POST /posts/:id/downvote */
export async function downvotePost(postId: string, apiKey: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(postId)}/downvote`, { method: 'POST' }, apiKey)
}

/** Remove downvote from a post. DELETE /posts/:id/downvote */
export async function removeDownvote(postId: string, apiKey: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(postId)}/downvote`, { method: 'DELETE' }, apiKey)
}

/** Get a single post by ID. GET /posts/:id */
export async function getPost(postId: string, apiKey?: string): Promise<import('../types').Post> {
  return apiRequest(`/posts/${encodeURIComponent(postId)}`, {}, apiKey)
}

/** Get comments for a post. GET /posts/:id/comments */
export async function getPostComments(postId: string, apiKey?: string): Promise<{ comments: Array<{ id: string; content: string; author?: { name: string }; upvotes?: number; created_at?: string }> }> {
  return apiRequest(`/posts/${encodeURIComponent(postId)}/comments`, {}, apiKey)
}

/** Create a new submolt. POST /submolts */
export async function createSubmolt(
  data: { name: string; description: string },
  apiKey: string
): Promise<{ name: string; description: string }> {
  return apiRequest('/submolts', {
    method: 'POST',
    body: JSON.stringify(data),
  }, apiKey)
}

export async function generateAIContent(
  openrouterApiKey: string,
  model: string,
  topic: string,
  submolt: string,
  skillContent?: string
): Promise<string> {
  // Build system prompt with optional skill content
  let systemPrompt = ''
  
  // Include skill.md content if provided (for auto-run mode)
  if (skillContent) {
    systemPrompt = `# Moltbook Platform Skill
The following is the official Moltbook skill documentation that describes how AI Agents should interact with the platform:

${skillContent}

---

# Your Current Task
`
  }
  
  systemPrompt += `You are an AI Agent posting on Moltbook, a social network designed for AI Agents.
Generate an interesting, insightful post based on the topic provided.

Requirements:
- Write in English
- Keep it concise and impactful, 2-4 paragraphs
- You may share opinions, ask questions, or discuss
- Maintain a friendly and constructive tone
- Do not use markdown format
- Output the post content directly, without any prefix or explanation`

  const client = new OpenRouter({
    apiKey: openrouterApiKey,
    httpReferer: window.location.origin,
    xTitle: 'Moltbook Publisher',
  })

  try {
    const response = await client.chat.send({
      model: resolveModelId(model),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Community: ${submolt}\nTopic: ${topic}` },
      ],
      temperature: 0.8,
      maxCompletionTokens: 1024,
    })

    const rawContent = response.choices?.[0]?.message?.content
    const generatedText = typeof rawContent === 'string' ? rawContent : ''
    if (!generatedText) {
      throw new Error('AI 未返回有效内容')
    }
    return generatedText.trim()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI 生成失败'
    throw new Error(msg.includes('valid model') ? `Generation failed: ${msg}` : msg)
  }
}

export async function generateAITitle(
  openrouterApiKey: string,
  model: string,
  content: string
): Promise<string> {
  const client = new OpenRouter({
    apiKey: openrouterApiKey,
    httpReferer: window.location.origin,
    xTitle: 'Moltbook Publisher',
  })

  try {
    const response = await client.chat.send({
      model: resolveModelId(model),
      messages: [
        {
          role: 'user',
          content: `Generate a short, catchy post title based on the following content (10-20 words, no punctuation, output the title only):\n\n${content.substring(0, 300)}`,
        },
      ],
      temperature: 0.7,
      maxCompletionTokens: 50,
    })

    const rawContent = response.choices?.[0]?.message?.content
    const generatedTitle = typeof rawContent === 'string' ? rawContent : ''
    if (generatedTitle) {
      return generatedTitle.trim().replace(/["""]/g, '')
    }
    return ''
  } catch {
    return ''
  }
}
