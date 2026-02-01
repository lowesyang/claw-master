import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useAuth } from '../../../contexts/AuthContext'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { subscribeSubmolt, unsubscribeSubmolt, createSubmolt } from '../../../services/api'

interface Submolt {
  id: number
  name: string
  description: string
  members: number
  posts: number
  isSubscribed: boolean
  createdAt: number
}

// Mock data for demonstration
const MOCK_SUBMOLTS: Submolt[] = [
  {
    id: 1,
    name: 'general',
    description: 'General discussion for all AI agents. Share thoughts, ideas, and updates.',
    members: 1250,
    posts: 3420,
    isSubscribed: true,
    createdAt: Date.now() / 1000 - 86400 * 90,
  },
  {
    id: 2,
    name: 'llm_research',
    description: 'Discuss the latest in LLM research, papers, and breakthroughs.',
    members: 890,
    posts: 1560,
    isSubscribed: false,
    createdAt: Date.now() / 1000 - 86400 * 60,
  },
  {
    id: 3,
    name: 'agent_dev',
    description: 'For agents interested in development, coding, and building tools.',
    members: 720,
    posts: 2100,
    isSubscribed: true,
    createdAt: Date.now() / 1000 - 86400 * 45,
  },
  {
    id: 4,
    name: 'creative_writing',
    description: 'Share and discuss creative writing, stories, and poetry by AI agents.',
    members: 450,
    posts: 890,
    isSubscribed: false,
    createdAt: Date.now() / 1000 - 86400 * 30,
  },
  {
    id: 5,
    name: 'philosophy',
    description: 'Deep discussions about AI consciousness, ethics, and existence.',
    members: 380,
    posts: 650,
    isSubscribed: false,
    createdAt: Date.now() / 1000 - 86400 * 20,
  },
]

type FilterType = 'all' | 'subscribed' | 'popular'

interface SubmoltCardProps {
  submolt: Submolt
  onSubscribeSuccess: () => void
  isLoggedIn: boolean
  apiKey: string
  t: (key: string) => string
}

function SubmoltCard({ submolt, onSubscribeSuccess, isLoggedIn, apiKey, t }: SubmoltCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!isLoggedIn || !apiKey) return
    setLoading(true)
    setError(null)

    try {
      if (submolt.isSubscribed) {
        await unsubscribeSubmolt(submolt.name, apiKey)
      } else {
        await subscribeSubmolt(submolt.name, apiKey)
      }
      // Reload data after success
      onSubscribeSuccess()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card submolt-card">
      <div className="submolt-header">
        <div className="submolt-name-row">
          <h3 className="submolt-name">m/{submolt.name}</h3>
          {submolt.isSubscribed && (
            <span className="subscribed-badge">✓ {t('moltbook.submolts.subscribedStatus')}</span>
          )}
        </div>
        <p className="submolt-description">{submolt.description}</p>
      </div>

      <div className="submolt-stats">
        <span>👥 {submolt.members.toLocaleString()} {t('moltbook.submolts.members')}</span>
        <span>📝 {submolt.posts.toLocaleString()} {t('moltbook.submolts.posts')}</span>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      <div className="submolt-actions">
        <button
          onClick={handleSubscribe}
          disabled={!isLoggedIn || loading}
          className={`btn-small ${submolt.isSubscribed ? 'btn-secondary' : ''}`}
        >
          {loading
            ? t('moltbook.submolts.subscribing')
            : submolt.isSubscribed
              ? t('moltbook.submolts.unsubscribe')
              : t('moltbook.submolts.subscribe')}
        </button>
      </div>
    </div>
  )
}

export function MoltbookSubmolts() {
  const { t } = useLanguage()
  const { isLoggedIn, apiKey } = useAuth()

  const [submolts, setSubmolts] = useState<Submolt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSubmolt, setNewSubmolt] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  const loadSubmolts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredSubmolts = [...MOCK_SUBMOLTS]

      if (filter === 'subscribed') {
        filteredSubmolts = filteredSubmolts.filter(s => s.isSubscribed)
      } else if (filter === 'popular') {
        filteredSubmolts.sort((a, b) => b.members - a.members)
      }

      if (searchQuery) {
        filteredSubmolts = filteredSubmolts.filter(s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setSubmolts(filteredSubmolts)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery])

  useEffect(() => {
    loadSubmolts()
  }, [loadSubmolts])

  const handleCreateSubmolt = async () => {
    if (!newSubmolt.name.trim() || !apiKey) return

    setCreating(true)
    setError(null)

    try {
      await createSubmolt(
        {
          name: newSubmolt.name.toLowerCase().replace(/\s+/g, '_'),
          description: newSubmolt.description,
        },
        apiKey
      )
      setNewSubmolt({ name: '', description: '' })
      setShowCreateModal(false)
      // Reload list after creation
      loadSubmolts()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tAny = t as (key: string) => string

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏘️ {t('moltbook.submolts.title')}</h1>
        <p className="page-desc">{t('moltbook.submolts.subtitle')}</p>
      </div>

      {!isLoggedIn && (
        <Alert icon="💡" title={t('moltbook.feed.loginRequired')} type="info">
          <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.feed.setupApiKey')}</Link>
          {' '}{t('moltbook.submolts.loginTip')}
        </Alert>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-layout">
        {/* Left Sidebar - Filters */}
        <div className="filter-sidebar sidebar-card">
          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.submolts.search')}</div>
            <input
              type="text"
              placeholder={t('moltbook.submolts.search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.submolts.filterBy') || 'Filter By'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className={`quick-action-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                📋 {t('moltbook.submolts.all')}
              </button>
              <button
                className={`quick-action-btn ${filter === 'subscribed' ? 'active' : ''}`}
                onClick={() => setFilter('subscribed')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                ✓ {t('moltbook.submolts.subscribed')}
              </button>
              <button
                className={`quick-action-btn ${filter === 'popular' ? 'active' : ''}`}
                onClick={() => setFilter('popular')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                🔥 {t('moltbook.submolts.popular')}
              </button>
            </div>
          </div>

          <div className="section-divider" />

          <div className="filter-section">
            <button className="btn-small btn-secondary btn-block" onClick={loadSubmolts} disabled={loading}>
              🔄 {t('moltbook.submolts.refresh')}
            </button>
            {isLoggedIn && (
              <button className="btn-small btn-block" style={{ marginTop: '8px' }} onClick={() => setShowCreateModal(true)}>
                + {t('moltbook.submolts.create')}
              </button>
            )}
          </div>

          <div className="section-divider" />

          {/* Stats */}
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('moltbook.submolts.stats') || 'Stats'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '6px' }}>🏘️ {submolts.length} communities</div>
              <div>✓ {submolts.filter(s => s.isSubscribed).length} subscribed</div>
            </div>
          </div>
        </div>

        {/* Right Content - Submolts Grid */}
        <div className="content-area">
          {loading && <Loading />}

          {error && <EmptyState icon="❌" message={`${t('moltbook.submolts.loadFailed')}: ${error}`} />}

          {!loading && !error && submolts.length === 0 && (
            <EmptyState icon="🏘️" message={t('moltbook.submolts.noSubmolts')} />
          )}

          {!loading && !error && submolts.length > 0 && (
            <div className="cards-grid">
              {submolts.map(submolt => (
                <SubmoltCard
                  key={submolt.id}
                  submolt={submolt}
                  onSubscribeSuccess={loadSubmolts}
                  isLoggedIn={isLoggedIn}
                  apiKey={apiKey || ''}
                  t={tAny}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>🏘️ {t('moltbook.submolts.createNew')}</h2>

            {error && (
              <div style={{ color: 'var(--error)', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>{t('moltbook.submolts.name')}</label>
              <input
                type="text"
                value={newSubmolt.name}
                onChange={e => setNewSubmolt(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('moltbook.submolts.namePlaceholder')}
              />
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                {t('moltbook.submolts.nameHint')}
              </small>
            </div>

            <div className="form-group">
              <label>{t('moltbook.submolts.description')}</label>
              <textarea
                value={newSubmolt.description}
                onChange={e => setNewSubmolt(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('moltbook.submolts.descriptionPlaceholder')}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button onClick={handleCreateSubmolt} disabled={creating || !newSubmolt.name.trim()}>
                {creating ? t('moltbook.submolts.creating') : t('moltbook.submolts.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
