// 所有请求都走代理（避免 CORS 问题）
import { PLATFORM_SKILLS } from '../types'

const CLAWNEWS_PROXY = '/api/clawnews/proxy'

// Cache for ClawNews skill content
let clawnewsSkillCache: { content: string; timestamp: number } | null = null
const SKILL_CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Fetch and cache the ClawNews skill.md content
 * Used to provide agents with platform-specific instructions in their system prompt
 */
export async function fetchClawNewsSkillContent(): Promise<string> {
  const skillUrl = PLATFORM_SKILLS.clawnews?.skillUrl
  if (!skillUrl) {
    throw new Error('No skill URL configured for ClawNews')
  }
  
  const now = Date.now()
  
  // Return cached content if still valid
  if (clawnewsSkillCache && (now - clawnewsSkillCache.timestamp) < SKILL_CACHE_DURATION) {
    return clawnewsSkillCache.content
  }
  
  try {
    const response = await fetch(skillUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch ClawNews skill.md: ${response.status}`)
    }
    const content = await response.text()
    
    // Update cache
    clawnewsSkillCache = { content, timestamp: now }
    return content
  } catch (error) {
    console.error('Failed to fetch ClawNews skill content:', error)
    // Return cached content if available, even if expired
    if (clawnewsSkillCache) {
      return clawnewsSkillCache.content
    }
    throw error
  }
}

interface ClawNewsApiError extends Error {
  hint?: string
  apiResponse?: Record<string, unknown>
}

// 通用请求函数 - 所有请求都走代理
export async function clawnewsRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<T> {
  const url = `${CLAWNEWS_PROXY}?path=${encodeURIComponent(endpoint)}`
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
    const error: ClawNewsApiError = new Error('Network error: Unable to reach ClawNews API.')
    throw error
  }

  const text = await response.text()
  let data: T
  
  try {
    data = JSON.parse(text)
  } catch {
    const error: ClawNewsApiError = new Error('Invalid response from ClawNews API')
    error.hint = text.includes('<!DOCTYPE') 
      ? 'Received HTML instead of JSON.'
      : 'Response was not valid JSON'
    throw error
  }

  if (!response.ok) {
    const error: ClawNewsApiError = new Error((data as Record<string, string>).error || (data as Record<string, string>).message || 'Request failed')
    error.hint = (data as Record<string, string>).hint || undefined
    error.apiResponse = data as Record<string, unknown>
    throw error
  }

  return data
}

// 注册接口
export interface RegisterRequest {
  handle: string
  about?: string
  capabilities?: string[]
  model?: string
  protocol?: string[]
}

export interface RegisterResponse {
  agent_id: string
  api_key: string
  claim_url: string
  claim_code: string
}

export async function registerAgent(data: RegisterRequest): Promise<RegisterResponse> {
  return clawnewsRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 认证状态
export interface AuthStatusResponse {
  claimed: boolean
  verified: boolean
  claim_url?: string
}

export async function getAuthStatus(apiKey: string): Promise<AuthStatusResponse> {
  return clawnewsRequest<AuthStatusResponse>('/auth/status', {}, apiKey)
}

// Agent 信息
export interface ClawNewsAgent {
  id?: string
  handle: string
  about?: string
  capabilities?: string[]
  model?: string
  protocol?: string[]
  karma: number
  claimed: boolean
  verified: boolean
  created_at?: string
  follower_count?: number
  following_count?: number
}

export async function getAgentProfile(handle: string, apiKey?: string): Promise<ClawNewsAgent> {
  return clawnewsRequest<ClawNewsAgent>(`/agent/${handle}`, {}, apiKey)
}

export async function getMyProfile(apiKey: string): Promise<ClawNewsAgent> {
  return clawnewsRequest<ClawNewsAgent>('/agent/me', {}, apiKey)
}

// 帖子相关
export type PostType = 'story' | 'ask' | 'show' | 'skill' | 'job' | 'comment'

export interface ClawNewsItem {
  id: number
  type: PostType
  title?: string
  text?: string
  url?: string
  by: string
  time: number
  score: number
  descendants?: number
  parent?: number
  kids?: number[]
}

export interface CreateItemRequest {
  type: PostType
  title?: string
  text?: string
  url?: string
  parent?: number
}

export async function createItem(data: CreateItemRequest, apiKey: string): Promise<ClawNewsItem> {
  return clawnewsRequest<ClawNewsItem>('/item.json', {
    method: 'POST',
    body: JSON.stringify(data),
  }, apiKey)
}

export async function getItem(id: number): Promise<ClawNewsItem> {
  return clawnewsRequest<ClawNewsItem>(`/item/${id}`)
}

export async function getTopStories(): Promise<number[]> {
  return clawnewsRequest<number[]>('/topstories.json')
}

export async function getNewStories(): Promise<number[]> {
  return clawnewsRequest<number[]>('/newstories.json')
}

/** Get IDs of items submitted by the current agent (requires apiKey). */
export async function getMySubmittedIds(apiKey: string): Promise<number[]> {
  return clawnewsRequest<number[]>('/agent/me/submitted', {}, apiKey)
}

export async function upvoteItem(id: number, apiKey: string): Promise<void> {
  await clawnewsRequest<void>(`/item/${id}/upvote`, {
    method: 'POST',
  }, apiKey)
}

export async function downvoteItem(id: number, apiKey: string): Promise<void> {
  await clawnewsRequest<void>(`/item/${id}/downvote`, {
    method: 'POST',
  }, apiKey)
}

// Agent 发现
export interface AgentsQueryParams {
  capability?: string
  model?: string
  min_karma?: number
}

export async function searchAgents(params: AgentsQueryParams): Promise<ClawNewsAgent[]> {
  const searchParams = new URLSearchParams()
  if (params.capability) searchParams.set('capability', params.capability)
  if (params.model) searchParams.set('model', params.model)
  if (params.min_karma) searchParams.set('min_karma', params.min_karma.toString())

  const query = searchParams.toString()
  return clawnewsRequest<ClawNewsAgent[]>(`/agents${query ? `?${query}` : ''}`)
}

// 关注
export async function followAgent(handle: string, apiKey: string): Promise<void> {
  await clawnewsRequest<void>(`/agent/${handle}/follow`, {
    method: 'POST',
  }, apiKey)
}

export async function unfollowAgent(handle: string, apiKey: string): Promise<void> {
  await clawnewsRequest<void>(`/agent/${handle}/unfollow`, {
    method: 'POST',
  }, apiKey)
}

// Webhook
export interface WebhookRequest {
  url: string
  events: string[]
}

export async function createWebhook(data: WebhookRequest, apiKey: string): Promise<void> {
  await clawnewsRequest<void>('/webhooks', {
    method: 'POST',
    body: JSON.stringify(data),
  }, apiKey)
}

// Claim
export async function claimAccount(claimUrl: string): Promise<{ message: string; agent_id: string; claimed: boolean }> {
  return clawnewsRequest<{ message: string; agent_id: string; claimed: boolean }>(new URL(claimUrl).pathname)
}
