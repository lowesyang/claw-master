import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { getMySubmittedIds, getItem, upvoteItem, ClawNewsItem } from '../../../services/clawnews'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFunc = (key: any) => string

function formatTime(timestamp: number, t: TranslateFunc): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}${t('clawnews.feed.secondsAgo')}`
  if (diff < 3600) return `${Math.floor(diff / 60)}${t('clawnews.feed.minutesAgo')}`
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t('clawnews.feed.hoursAgo')}`
  return `${Math.floor(diff / 86400)}${t('clawnews.feed.daysAgo')}`
}

function getTypeLabel(type: string, t: TranslateFunc): string {
  const labels: Record<string, string> = {
    story: t('clawnews.feed.typeStory'),
    ask: t('clawnews.feed.typeAsk'),
    show: t('clawnews.feed.typeShow'),
    skill: t('clawnews.feed.typeSkill'),
    job: t('clawnews.feed.typeJob'),
    comment: t('clawnews.feed.typeComment'),
  }
  return labels[type] || type
}

function getTypeColor(_type: string): string {
  return 'var(--accent)'
}

interface FeedItemProps {
  item: ClawNewsItem
  onUpvote: (id: number) => void
  isLoggedIn: boolean
  t: TranslateFunc
}

function FeedItemCard({ item, onUpvote, isLoggedIn, t }: FeedItemProps) {
  return (
    <div className="feed-item">
      <div className="feed-item-header">
        <span
          className="feed-item-submolt"
          style={{ color: getTypeColor(item.type) }}
        >
          {getTypeLabel(item.type, t)}
        </span>
        <span className="feed-item-time">{formatTime(item.time, t)}</span>
      </div>
      {item.title && (
        <div className="feed-item-title">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </div>
      )}
      {item.text && (
        <div className="feed-item-content" style={{ whiteSpace: 'pre-wrap' }}>
          {item.text.length > 300 ? `${item.text.substring(0, 300)}...` : item.text}
        </div>
      )}
      <div className="feed-item-footer">
        <span
          style={{ cursor: isLoggedIn ? 'pointer' : 'default' }}
          onClick={() => isLoggedIn && onUpvote(item.id)}
          title={isLoggedIn ? t('clawnews.feed.upvote') : t('clawnews.feed.loginToUpvote')}
        >
          ▲ {item.score}
        </span>
        <span>@{item.by}</span>
        {item.descendants !== undefined && (
          <span>{item.descendants} {t('clawnews.feed.comments')}</span>
        )}
      </div>
    </div>
  )
}

export function ClawNewsMyPosts() {
  const { isLoggedIn, apiKey } = useClawNews()
  const { t } = useLanguage()
  const [items, setItems] = useState<ClawNewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyPosts = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError(null)
    try {
      const ids = await getMySubmittedIds(apiKey)
      const limitedIds = (Array.isArray(ids) ? ids : []).slice(0, 50)
      const itemPromises = limitedIds.map(id => getItem(id).catch(() => null))
      const fetchedItems = await Promise.all(itemPromises)
      setItems(fetchedItems.filter((item): item is ClawNewsItem => item !== null))
    } catch (err) {
      // API may not implement /agent/me/submitted yet
      setError((err as Error).message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    if (isLoggedIn && apiKey) {
      loadMyPosts()
    }
  }, [isLoggedIn, apiKey, loadMyPosts])

  const handleUpvote = async (id: number) => {
    if (!isLoggedIn || !apiKey) return
    try {
      await upvoteItem(id, apiKey)
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, score: item.score + 1 } : item
        )
      )
    } catch (err) {
      console.error('Upvote failed:', err)
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{t('clawnews.feed.myPostsTitle')}</h1>
          <p className="page-desc">{t('clawnews.feed.myPostsSubtitle')}</p>
        </div>
        <Alert icon="💡" title={t('clawnews.feed.tip')} type="info">
          <Link to="/clawnews/setup" style={{ color: 'var(--accent)' }}>{t('clawnews.feed.login')}</Link> {t('clawnews.feed.loginHint')}
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('clawnews.feed.myPostsTitle')}</h1>
        <p className="page-desc">{t('clawnews.feed.myPostsSubtitle')}</p>
      </div>

      <div className="two-column-layout sidebar-layout">
        <div className="filter-sidebar sidebar-card">
          <div className="filter-section" role="radiogroup" aria-label={t('clawnews.feed.view')}>
            <div className="filter-section-title">{t('clawnews.feed.view')}</div>
            <div className="filter-option-list">
              <NavLink
                to="/clawnews/feed"
                end
                className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="filter-option-icon">📡</span>
                <span>{t('clawnews.feed.browseFeed')}</span>
              </NavLink>
              <NavLink
                to="/clawnews/feed/my-posts"
                className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="filter-option-icon">✏️</span>
                <span>{t('clawnews.feed.myPosts')}</span>
              </NavLink>
            </div>
          </div>
          <div className="section-divider" />
          <div className="filter-section">
            <button className="btn-small btn-secondary btn-block" onClick={loadMyPosts} disabled={loading}>
              🔄 {t('clawnews.feed.refresh')}
            </button>
            <Link to="/clawnews/post" style={{ textDecoration: 'none', display: 'block', marginTop: '8px' }}>
              <button className="btn-small btn-block">✏️ {t('clawnews.post.title') || 'New Post'}</button>
            </Link>
          </div>
          <div className="section-divider" />
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('clawnews.feed.stats') || 'Stats'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              📊 {items.length} {t('clawnews.feed.posts') || 'posts'}
            </div>
          </div>
        </div>

        <div className="content-area">
          {loading && <Loading />}
          {error && <EmptyState icon="❌" message={`${t('clawnews.feed.loadFailed')}: ${error}`} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState icon="📭" message={t('clawnews.feed.myPostsEmpty')} />
          )}
          {!loading && !error && items.length > 0 && (
            <div>
              {items.map(item => (
                <FeedItemCard
                  key={item.id}
                  item={item}
                  onUpvote={handleUpvote}
                  isLoggedIn={isLoggedIn}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
