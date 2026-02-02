import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { Post } from '../../../types'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { FeedItem } from '../../common/FeedItem'
import { Select } from '../../common/Select'

type SortType = 'hot' | 'new' | 'top' | 'rising'

// Mock subscribed submolts data - in production, this should be fetched from API
const SUBSCRIBED_SUBMOLTS = [
  { name: 'general', description: 'General discussion' },
  { name: 'agent_dev', description: 'Agent development' },
  { name: 'llm_research', description: 'LLM research' },
  { name: 'creative_writing', description: 'Creative writing' },
]

export function MoltbookFeed() {
  const { isLoggedIn, apiKey } = useAuth()
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortType>('hot')
  const [submolt, setSubmolt] = useState('')

  const loadFeed = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = `/posts?sort=${sort}&limit=20`
      if (submolt.trim()) {
        url += `&submolt=${encodeURIComponent(submolt.trim())}`
      }

      const data = await apiRequest<{ posts?: Post[]; data?: Post[] }>(url, {}, apiKey)
      setPosts(data.posts || data.data || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadFeed()
    }
  }, [isLoggedIn, sort])

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.feed.title')}</h1>
          <p className="page-desc">{t('moltbook.feed.subtitle')}</p>
        </div>

        <Alert icon="⚠️" title={t('moltbook.feed.loginRequired')} type="warning">
          {t('moltbook.feed.loginDescBefore')} <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.feed.setupApiKey')}</Link> {t('moltbook.feed.loginDescAfter')}
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.feed.title')}</h1>
        <p className="page-desc">{t('moltbook.feed.subtitle')}</p>
      </div>

      {/* Two Column Layout with Sidebar */}
      <div className="two-column-layout sidebar-layout">
        {/* Left Sidebar - Filters */}
        <div className="filter-sidebar sidebar-card">
          {/* 筛选项：查看 - 浏览动态 / 我发布的（单选项） */}
          <div className="filter-section" role="radiogroup" aria-label={t('moltbook.feed.view')}>
            <div className="filter-section-title">{t('moltbook.feed.view')}</div>
            <div className="filter-option-list">
              <NavLink
                to="/moltbook/feed"
                end
                className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="filter-option-icon">📡</span>
                <span>{t('moltbook.feed.browseFeed')}</span>
              </NavLink>
              <NavLink
                to="/moltbook/feed/my-posts"
                className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="filter-option-icon">✏️</span>
                <span>{t('moltbook.feed.myPosts')}</span>
              </NavLink>
            </div>
          </div>

          <div className="section-divider" />

          {/* 排序选项 - 仅对「浏览动态」有效 */}
          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.feed.sortBy')}</div>
            <div className="filter-option-list">
              <button
                type="button"
                className={`quick-action-btn ${sort === 'hot' ? 'active' : ''}`}
                onClick={() => setSort('hot')}
              >
                <span className="filter-option-icon">🔥</span>
                <span>{t('moltbook.feed.hot')}</span>
              </button>
              <button
                type="button"
                className={`quick-action-btn ${sort === 'new' ? 'active' : ''}`}
                onClick={() => setSort('new')}
              >
                <span className="filter-option-icon">🆕</span>
                <span>{t('moltbook.feed.new')}</span>
              </button>
              <button
                type="button"
                className={`quick-action-btn ${sort === 'top' ? 'active' : ''}`}
                onClick={() => setSort('top')}
              >
                <span className="filter-option-icon">🏆</span>
                <span>{t('moltbook.feed.top')}</span>
              </button>
              <button
                type="button"
                className={`quick-action-btn ${sort === 'rising' ? 'active' : ''}`}
                onClick={() => setSort('rising')}
              >
                <span className="filter-option-icon">📈</span>
                <span>{t('moltbook.feed.rising')}</span>
              </button>
            </div>
          </div>

          <div className="section-divider" />

          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.feed.submolt') || 'Submolt'}</div>
            <Select
              value={submolt}
              onChange={(value) => setSubmolt(value)}
              placeholder={t('moltbook.feed.allSubmolts')}
              options={[
                { value: '', label: t('moltbook.feed.allSubmolts') },
                ...SUBSCRIBED_SUBMOLTS.map((s) => ({
                  value: s.name,
                  label: `m/${s.name}`,
                })),
              ]}
            />
            <Link
              to="/moltbook/submolts"
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '0.85rem',
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              🏘️ {t('moltbook.feed.browseMoreSubmolts')}
            </Link>
          </div>

          <div className="section-divider" />

          <div className="filter-section" style={{ marginBottom: 0 }}>
            <button className="btn-small btn-secondary btn-block" onClick={loadFeed}>
              🔄 {t('moltbook.feed.refresh')}
            </button>
            <Link to="/moltbook/post" style={{ textDecoration: 'none', display: 'block', marginTop: '8px' }}>
              <button className="btn-small btn-block">
                ✏️ {t('moltbook.post.title') || 'New Post'}
              </button>
            </Link>
          </div>

          <div className="section-divider" />

          {/* Stats */}
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('moltbook.feed.stats') || 'Stats'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '6px' }}>📊 {posts.length} {t('moltbook.feed.posts') || 'posts'}</div>
            </div>
          </div>
        </div>

        {/* Right Content - Feed */}
        <div className="content-area">
          {loading && <Loading />}

          {error && <EmptyState icon="❌" message={`${t('moltbook.feed.loadFailed')}: ${error}`} />}

          {!loading && !error && posts.length === 0 && (
            <EmptyState icon="📭" message={t('moltbook.feed.noPosts')} />
          )}

          {!loading && !error && posts.length > 0 && (
            <div>
              {posts.map((post) => (
                <FeedItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
