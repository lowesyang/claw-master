import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useAuth } from '../../../contexts/AuthContext'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { subscribeSubmolt, unsubscribeSubmolt, createSubmolt, listSubmolts } from '../../../services/api'

interface Submolt {
  id: number
  name: string
  description: string
  members: number
  posts: number
  isSubscribed: boolean
  createdAt: number
}

// Fallback mock data when API is unavailable
const FALLBACK_SUBMOLTS: Submolt[] = [
  {
    id: 1,
    name: 'general',
    description: 'General discussion for all AI agents. Share thoughts, ideas, and updates.',
    members: 0,
    posts: 0,
    isSubscribed: false,
    createdAt: Date.now() / 1000 - 86400 * 90,
  },
]

type FilterType = 'all' | 'subscribed' | 'popular'

interface SubmoltCardProps {
  submolt: Submolt
  onSubscribeChange: (name: string, isSubscribed: boolean) => void
  isLoggedIn: boolean
  apiKey: string
  t: (key: string) => string
}

function SubmoltCard({ submolt, onSubscribeChange, isLoggedIn, apiKey, t }: SubmoltCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!isLoggedIn || !apiKey) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (submolt.isSubscribed) {
        await unsubscribeSubmolt(submolt.name, apiKey)
        onSubscribeChange(submolt.name, false)
        setSuccessMsg(t('moltbook.submolts.unsubscribeSuccess'))
      } else {
        await subscribeSubmolt(submolt.name, apiKey)
        onSubscribeChange(submolt.name, true)
        setSuccessMsg(t('moltbook.submolts.subscribeSuccess'))
      }
      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      const errorMsg = (err as Error).message
      // Provide more helpful error message for 404
      if (errorMsg.includes('404') || errorMsg.toLowerCase().includes('not found')) {
        setError(`m/${submolt.name} not found`)
      } else {
        setError(errorMsg)
      }
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

      {successMsg && (
        <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '8px' }}>
          ✓ {successMsg}
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

  const [allSubmolts, setAllSubmolts] = useState<Submolt[]>([]) // Full list for stats
  const [submolts, setSubmolts] = useState<Submolt[]>([]) // Filtered list for display
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
      // Fetch from real API
      const response = await listSubmolts(apiKey || undefined)
      
      // Handle different API response formats:
      // Could be { submolts: [...] }, { data: [...] }, or just [...]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData = (response as any)?.submolts || (response as any)?.data || (Array.isArray(response) ? response : [])
      
      // Transform API response to our Submolt interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let loadedSubmolts: Submolt[] = (rawData || []).map((s: any, index: number) => ({
        id: s.id || index + 1,
        name: s.name,
        description: s.description || '',
        members: s.members_count || s.members || s.subscriber_count || 0,
        posts: s.posts_count || s.posts || s.post_count || 0,
        isSubscribed: s.is_subscribed || s.isSubscribed || s.subscribed || false,
        createdAt: s.created_at ? new Date(s.created_at).getTime() / 1000 : Date.now() / 1000,
      }))

      // If API returns empty, use fallback
      if (loadedSubmolts.length === 0) {
        loadedSubmolts = [...FALLBACK_SUBMOLTS]
      }

      // Store full list for stats
      setAllSubmolts(loadedSubmolts)

      // Apply filters
      let filteredSubmolts = [...loadedSubmolts]

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
      console.error('Failed to load submolts from API:', err)
      // On API error, show fallback data with error message
      setAllSubmolts(FALLBACK_SUBMOLTS)
      setSubmolts(FALLBACK_SUBMOLTS)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery, apiKey])

  useEffect(() => {
    loadSubmolts()
  }, [loadSubmolts])

  const handleSubscribeChange = useCallback((name: string, isSubscribed: boolean) => {
    // Update local state without reloading
    const updateSubmolts = (list: Submolt[]) =>
      list.map(s => s.name === name ? { ...s, isSubscribed } : s)
    
    setAllSubmolts(updateSubmolts)
    setSubmolts(updateSubmolts)
  }, [])

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
              <div style={{ marginBottom: '6px' }}>🏘️ {allSubmolts.length} communities</div>
              <div>✓ {allSubmolts.filter(s => s.isSubscribed).length} subscribed</div>
            </div>
          </div>
        </div>

        {/* Right Content - Submolts Grid */}
        <div className="content-area">
          {loading && <Loading />}

          {error && <EmptyState icon="❌" message={`${t('moltbook.submolts.loadFailed')}: ${error}`} />}

          {!loading && !error && submolts.length === 0 && (
            <EmptyState 
              icon="🏘️" 
              message={
                filter === 'subscribed' 
                  ? t('moltbook.submolts.noSubscribed') || 'No subscribed communities yet. Subscribe to communities to see them here.'
                  : t('moltbook.submolts.noSubmolts')
              } 
            />
          )}

          {!loading && !error && submolts.length > 0 && (
            <div className="cards-grid">
              {submolts.map(submolt => (
                <SubmoltCard
                  key={submolt.id}
                  submolt={submolt}
                  onSubscribeChange={handleSubscribeChange}
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
