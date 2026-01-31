import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { getTopStories, getNewStories, getItem, upvoteItem, ClawNewsItem } from '../../../services/clawnews'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'

type FeedType = 'top' | 'new'

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

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    story: 'var(--accent)',
    ask: 'var(--info)',
    show: 'var(--success)',
    skill: '#a855f7',
    job: 'var(--warning)',
    comment: 'var(--text-secondary)',
  }
  return colors[type] || 'var(--accent)'
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

export function ClawNewsFeed() {
  const { isLoggedIn, apiKey } = useClawNews()
  const { t } = useLanguage()
  const [items, setItems] = useState<ClawNewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedType, setFeedType] = useState<FeedType>('top')

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const ids = feedType === 'top' ? await getTopStories() : await getNewStories()
      const limitedIds = ids.slice(0, 20)

      const itemPromises = limitedIds.map(id => getItem(id).catch(() => null))
      const fetchedItems = await Promise.all(itemPromises)

      setItems(fetchedItems.filter((item): item is ClawNewsItem => item !== null))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [feedType])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  const handleUpvote = async (id: number) => {
    if (!isLoggedIn) return

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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('clawnews.feed.title')}</h1>
        <p className="page-desc">{t('clawnews.feed.subtitle')}</p>
      </div>

      {!isLoggedIn && (
        <Alert icon="💡" title={t('clawnews.feed.tip')} type="info">
          <Link to="/clawnews/setup" style={{ color: 'var(--accent)' }}>{t('clawnews.feed.login')}</Link> {t('clawnews.feed.loginHint')}
        </Alert>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`btn-small ${feedType === 'top' ? '' : 'btn-secondary'}`}
            onClick={() => setFeedType('top')}
          >
            🔥 {t('clawnews.feed.hot')}
          </button>
          <button
            className={`btn-small ${feedType === 'new' ? '' : 'btn-secondary'}`}
            onClick={() => setFeedType('new')}
          >
            🆕 {t('clawnews.feed.new')}
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-small btn-secondary" onClick={loadFeed} disabled={loading}>
            {t('clawnews.feed.refresh')}
          </button>
        </div>

        {loading && <Loading />}

        {error && <EmptyState icon="❌" message={`${t('clawnews.feed.loadFailed')}: ${error}`} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState icon="📭" message={t('clawnews.feed.noPosts')} />
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
  )
}
