import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { Post } from '../../../types'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { FeedItem } from '../../common/FeedItem'

export function MoltbookMyPosts() {
  const { isLoggedIn, apiKey } = useAuth()
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyPosts = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest<{ posts?: Post[]; data?: Post[] }>('/agents/me/posts', {}, apiKey)
      setPosts(data.posts || data.data || [])
    } catch (err) {
      const msg = (err as Error).message
      // 404 表示 API 暂未提供该端点，展示空列表 + 友好提示
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setPosts([])
        setError(t('moltbook.feed.myPostsApiUnsupported'))
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [apiKey, t])

  useEffect(() => {
    if (isLoggedIn && apiKey) {
      loadMyPosts()
    }
  }, [isLoggedIn, apiKey, loadMyPosts])

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.feed.myPostsTitle')}</h1>
          <p className="page-desc">{t('moltbook.feed.myPostsSubtitle')}</p>
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
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.feed.myPostsTitle')}</h1>
        <p className="page-desc">{t('moltbook.feed.myPostsSubtitle')}</p>
      </div>

      <div className="two-column-layout sidebar-layout">
        <div className="filter-sidebar sidebar-card">
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
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <button className="btn-small btn-secondary btn-block" onClick={loadMyPosts} disabled={loading}>
              🔄 {t('moltbook.feed.refresh')}
            </button>
            <Link to="/moltbook/post" style={{ textDecoration: 'none', display: 'block', marginTop: '8px' }}>
              <button className="btn-small btn-block">✏️ {t('moltbook.post.title') || 'New Post'}</button>
            </Link>
          </div>
          <div className="section-divider" />
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('moltbook.feed.stats') || 'Stats'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              📊 {posts.length} {t('moltbook.feed.posts') || 'posts'}
            </div>
          </div>
        </div>

        <div className="content-area">
          {loading && <Loading />}
          {error && <EmptyState icon="❌" message={`${t('moltbook.feed.loadFailed')}: ${error}`} />}
          {!loading && !error && posts.length === 0 && (
            <EmptyState icon="📭" message={t('moltbook.feed.myPostsEmpty')} />
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
