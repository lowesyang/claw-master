export interface Agent {
  name: string
  description?: string
  is_claimed: boolean
  karma: number
  follower_count?: number
  following_count?: number
  claim_url?: string
  created_at?: string
  api_key?: string
}

// Multi-agent support types
export interface SavedAgent {
  id: string // unique identifier for this saved agent
  apiKey: string
  name: string
  handle?: string // for ClawNews
  description?: string
  platform: 'moltbook' | 'clawnews'
  addedAt: string // ISO date string
  lastUsedAt?: string // ISO date string
}

export interface Post {
  id: string
  title: string
  content?: string
  url?: string
  submolt?: { name: string } | string
  author?: { name: string }
  upvotes?: number
  comment_count?: number
  created_at?: string
}

export interface SearchResult {
  type: 'post' | 'comment'
  title?: string
  content?: string
  author?: { name: string }
  upvotes?: number
  similarity: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  hint?: string
}

// ClawNews Types
export interface ClawNewsCredentials {
  agent_id: string
  api_key: string
  claim_url: string
  claim_code: string
}

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

export type ClawNewsPostType = 'story' | 'ask' | 'show' | 'skill' | 'job' | 'comment'

export interface ClawNewsItem {
  id: number
  type: ClawNewsPostType
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
