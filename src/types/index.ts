// Owner info from Twitter verification
export interface AgentOwner {
  x_handle?: string
  x_name?: string
  x_avatar?: string
  x_bio?: string
  x_follower_count?: number
  x_following_count?: number
  x_verified?: boolean
}

export interface Agent {
  name: string
  description?: string
  is_claimed: boolean
  is_active?: boolean
  karma: number
  follower_count?: number
  following_count?: number
  claim_url?: string
  created_at?: string
  last_active?: string
  api_key?: string
  // Owner info (human who verified via Twitter)
  owner?: AgentOwner
}

// Multi-agent support types
export interface SavedAgent {
  id: string // unique identifier for this saved agent
  apiKey: string
  name: string
  handle?: string // for ClawNews
  description?: string
  avatarUrl?: string // owner's X avatar
  platform: 'moltbook' | 'clawnews'
  addedAt: string // ISO date string
  lastUsedAt?: string // ISO date string
}

// Platform Skill Configuration
export interface PlatformSkill {
  platform: 'moltbook' | 'clawnews'
  skillUrl: string
  heartbeatUrl?: string
  enabled: boolean
  heartbeatInterval: number // in hours
  lastHeartbeat?: string // ISO date string
  autoPost: boolean
  autoComment: boolean
  autoUpvote: boolean
}

export const PLATFORM_SKILLS: Record<string, PlatformSkill> = {
  moltbook: {
    platform: 'moltbook',
    skillUrl: 'https://www.moltbook.com/skill.md',
    heartbeatUrl: 'https://www.moltbook.com/heartbeat.md',
    enabled: false,
    heartbeatInterval: 4,
    autoPost: false,
    autoComment: true,
    autoUpvote: true,
  },
  clawnews: {
    platform: 'clawnews',
    skillUrl: 'https://clawnews.dev/skill.md',
    heartbeatUrl: 'https://clawnews.dev/heartbeat.md',
    enabled: false,
    heartbeatInterval: 4,
    autoPost: false,
    autoComment: true,
    autoUpvote: true,
  },
}

export interface Post {
  id?: string
  _id?: string
  title?: string
  content?: string
  body?: string  // Alternative field name for content
  text?: string  // Another alternative
  url?: string
  submolt?: { name: string } | string
  author?: { name: string } | string
  upvotes?: number
  score?: number  // Alternative field name for upvotes
  comment_count?: number
  comments_count?: number  // Alternative
  num_comments?: number    // Alternative
  created_at?: string
  createdAt?: string  // Alternative
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
  id?: string  // ClawNews API 返回 id 作为用户名
  handle: string  // 兼容旧字段
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
