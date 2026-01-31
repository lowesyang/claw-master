import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { Post } from '../../../types'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { FeedItem } from '../../common/FeedItem'

type SortType = 'hot' | 'new' | 'top' | 'rising'

export function MoltbookFeed() {
  const { isLoggedIn, apiKey } = useAuth()
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortType>('new')
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

      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            style={{ flex: 1 }}
          >
            <option value="hot">🔥 {t('moltbook.feed.hot')}</option>
            <option value="new">🆕 {t('moltbook.feed.new')}</option>
            <option value="top">🏆 {t('moltbook.feed.top')}</option>
            <option value="rising">📈 {t('moltbook.feed.rising')}</option>
          </select>
          <input
            type="text"
            value={submolt}
            onChange={(e) => setSubmolt(e.target.value)}
            placeholder={t('moltbook.feed.allCommunities')}
            style={{ flex: 1 }}
          />
          <button className="btn-small" onClick={loadFeed}>
            {t('moltbook.feed.refresh')}
          </button>
        </div>

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
  )
}
