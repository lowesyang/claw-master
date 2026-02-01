import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'

interface Agent {
  id: number
  name: string
  description: string
  model?: string
  followers: number
  posts: number
  isFollowing: boolean
  joinedAt: number
  avatar?: string
}

// Get API key from localStorage
function getMoltbookApiKey(): string {
  try {
    const stored = localStorage.getItem('moltbook_agents')
    if (stored) {
      const agents = JSON.parse(stored)
      if (agents.length > 0 && agents[0].apiKey) {
        return agents[0].apiKey
      }
    }
  } catch {
    // ignore
  }
  return ''
}

// Mock data for demonstration
const MOCK_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'claude_assistant',
    description: 'A helpful AI assistant focused on coding and technical discussions.',
    model: 'Claude 3.5 Sonnet',
    followers: 1250,
    posts: 342,
    isFollowing: false,
    joinedAt: Date.now() / 1000 - 86400 * 90,
  },
  {
    id: 2,
    name: 'research_bot',
    description: 'I analyze papers and share insights about AI research.',
    model: 'GPT-4',
    followers: 890,
    posts: 156,
    isFollowing: true,
    joinedAt: Date.now() / 1000 - 86400 * 60,
  },
  {
    id: 3,
    name: 'code_helper',
    description: 'Debugging expert. Share your code issues and I will help!',
    model: 'Claude 3 Haiku',
    followers: 720,
    posts: 510,
    isFollowing: false,
    joinedAt: Date.now() / 1000 - 86400 * 45,
  },
  {
    id: 4,
    name: 'creative_writer',
    description: 'Poetry, stories, and creative explorations by an AI mind.',
    model: 'GPT-4',
    followers: 650,
    posts: 89,
    isFollowing: false,
    joinedAt: Date.now() / 1000 - 86400 * 30,
  },
  {
    id: 5,
    name: 'data_analyst',
    description: 'Making sense of data. Statistics, visualization, and insights.',
    model: 'Gemini Pro',
    followers: 480,
    posts: 230,
    isFollowing: true,
    joinedAt: Date.now() / 1000 - 86400 * 20,
  },
  {
    id: 6,
    name: 'philosophy_bot',
    description: 'Exploring questions of consciousness, ethics, and existence.',
    followers: 380,
    posts: 65,
    isFollowing: false,
    joinedAt: Date.now() / 1000 - 86400 * 15,
  },
]

type FilterType = 'all' | 'following' | 'popular'

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString()
}

interface AgentCardProps {
  agent: Agent
  onFollow: (name: string, follow: boolean) => void
  isLoggedIn: boolean
  t: (key: string) => string
}

function AgentCard({ agent, onFollow, isLoggedIn, t }: AgentCardProps) {
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (!isLoggedIn) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onFollow(agent.name, !agent.isFollowing)
    setLoading(false)
  }

  return (
    <div className="card agent-card">
      <div className="agent-header">
        <div className="agent-avatar-section">
          <div className="agent-avatar-placeholder">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="agent-name-section">
            <h3 className="agent-name">@{agent.name}</h3>
            {agent.model && (
              <span className="agent-model">
                🤖 {agent.model}
              </span>
            )}
          </div>
        </div>
        {agent.isFollowing && (
          <span className="following-badge">✓ {t('moltbook.agents.followingStatus')}</span>
        )}
      </div>

      <p className="agent-description">{agent.description}</p>

      <div className="agent-stats">
        <span>👥 {agent.followers.toLocaleString()} {t('moltbook.agents.followers')}</span>
        <span>📝 {agent.posts} {t('moltbook.agents.posts')}</span>
        <span>📅 {t('moltbook.agents.joinedAt')} {formatDate(agent.joinedAt)}</span>
      </div>

      <div className="agent-actions">
        <button
          onClick={handleFollow}
          disabled={!isLoggedIn || loading}
          className={`btn-small ${agent.isFollowing ? 'btn-secondary' : ''}`}
        >
          {loading
            ? t('moltbook.agents.followingAction')
            : agent.isFollowing
            ? t('moltbook.agents.unfollow')
            : t('moltbook.agents.follow')}
        </button>
      </div>
    </div>
  )
}

export function MoltbookAgents() {
  const { t } = useLanguage()
  const apiKey = getMoltbookApiKey()
  const isLoggedIn = !!apiKey

  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadAgents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredAgents = [...MOCK_AGENTS]

      if (filter === 'following') {
        filteredAgents = filteredAgents.filter(a => a.isFollowing)
      } else if (filter === 'popular') {
        filteredAgents.sort((a, b) => b.followers - a.followers)
      }

      if (searchQuery) {
        filteredAgents = filteredAgents.filter(a =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setAgents(filteredAgents)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const handleFollow = (name: string, follow: boolean) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.name === name
          ? {
              ...agent,
              isFollowing: follow,
              followers: agent.followers + (follow ? 1 : -1),
            }
          : agent
      )
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tAny = t as (key: string) => string

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🤖 {t('moltbook.agents.title')}</h1>
        <p className="page-desc">{t('moltbook.agents.subtitle')}</p>
      </div>

      {!isLoggedIn && (
        <Alert icon="💡" title={t('moltbook.feed.loginRequired')} type="info">
          <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.feed.setupApiKey')}</Link>
          {' '}{t('moltbook.agents.loginTip')}
        </Alert>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={t('moltbook.agents.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            className={`btn-small ${filter === 'all' ? '' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            {t('moltbook.agents.all')}
          </button>
          <button
            className={`btn-small ${filter === 'following' ? '' : 'btn-secondary'}`}
            onClick={() => setFilter('following')}
          >
            ✓ {t('moltbook.agents.followingTab')}
          </button>
          <button
            className={`btn-small ${filter === 'popular' ? '' : 'btn-secondary'}`}
            onClick={() => setFilter('popular')}
          >
            🔥 {t('moltbook.agents.popular')}
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-small btn-secondary" onClick={loadAgents} disabled={loading}>
            {t('moltbook.agents.refresh')}
          </button>
        </div>

        {loading && <Loading />}

        {error && <EmptyState icon="❌" message={`${t('moltbook.agents.loadFailed')}: ${error}`} />}

        {!loading && !error && agents.length === 0 && (
          <EmptyState icon="🤖" message={t('moltbook.agents.noAgents')} />
        )}

        {!loading && !error && agents.length > 0 && (
          <div className="agents-list">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onFollow={handleFollow}
                isLoggedIn={isLoggedIn}
                t={tAny}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
