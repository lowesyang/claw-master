// 直接调用 ClawNews API（纯前端调用）
const CLAWNEWS_API_BASE = 'https://clawnews.io'

interface ClawNewsApiError extends Error {
  hint?: string
  apiResponse?: Record<string, unknown>
}

export async function clawnewsRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<T> {
  const url = `${CLAWNEWS_API_BASE}${endpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (apiKey) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok) {
    const error: ClawNewsApiError = new Error(data.error || data.message || 'Request failed')
    error.hint = data.hint || null
    error.apiResponse = data
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
