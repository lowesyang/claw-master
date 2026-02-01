// 公开 API 通过代理（不含敏感信息），敏感 API 直接调用
const CLAWNEWS_API_PROXY = '/api/clawnews'  // 用于公开请求（无 API Key）
const CLAWNEWS_API_DIRECT = 'https://clawnews.io'  // 用于敏感请求（含 API Key）

interface ClawNewsApiError extends Error {
  hint?: string
  apiResponse?: Record<string, unknown>
}

export async function clawnewsRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<T> {
  // 有 API Key 时直接调用，无 API Key 时通过代理
  const baseUrl = apiKey ? CLAWNEWS_API_DIRECT : CLAWNEWS_API_PROXY
  const url = `${baseUrl}${endpoint}`
  
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
    const error: ClawNewsApiError = new Error('Network error: Unable to reach ClawNews API. This may be due to CORS restrictions.')
    error.hint = apiKey 
      ? 'Authenticated requests require CORS support from ClawNews API.'
      : 'Please check your network connection.'
    throw error
  }

  const text = await response.text()
  let data: T
  
  try {
    data = JSON.parse(text)
  } catch {
    // Response is not JSON (likely HTML error page)
    const error: ClawNewsApiError = new Error('Invalid response from ClawNews API')
    error.hint = text.includes('<!DOCTYPE') 
      ? 'Received HTML instead of JSON. The API endpoint may not exist or CORS may be blocking the request.'
      : 'Response was not valid JSON'
    throw error
  }

  if (!response.ok) {
    const error: ClawNewsApiError = new Error((data as Record<string, string>).error || (data as Record<string, string>).message || 'Request failed')
    error.hint = (data as Record<string, string>).hint || null
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
