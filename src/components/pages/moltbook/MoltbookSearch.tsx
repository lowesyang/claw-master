import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { SearchResult } from '../../../types'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { FeedItem } from '../../common/FeedItem'

type SearchType = 'all' | 'posts' | 'comments'

export function MoltbookSearch() {
  const { isLoggedIn, apiKey } = useAuth()
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const url = `/search?q=${encodeURIComponent(query.trim())}&type=${searchType}&limit=20`
      const data = await apiRequest<{ results?: SearchResult[] }>(url, {}, apiKey)
      setResults(data.results || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.search.title')}</h1>
          <p className="page-desc">{t('moltbook.search.desc')}</p>
        </div>

        <Alert icon="⚠️" title={t('moltbook.search.loginRequired')} type="warning">
          {t('moltbook.search.loginPrefix')} <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.search.configureApiKey')}</Link> {t('moltbook.search.loginSuffix')}
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.search.title')}</h1>
        <p className="page-desc">{t('moltbook.search.desc')}</p>
      </div>

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-layout">
        {/* Left Sidebar - Search Form */}
        <div className="filter-sidebar sidebar-card">
          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.search.label')}</div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('moltbook.search.placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-section">
            <div className="filter-section-title">{t('moltbook.search.type') || 'Type'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className={`quick-action-btn ${searchType === 'all' ? 'active' : ''}`}
                onClick={() => setSearchType('all')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                📋 {t('moltbook.search.all')}
              </button>
              <button
                className={`quick-action-btn ${searchType === 'posts' ? 'active' : ''}`}
                onClick={() => setSearchType('posts')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                📝 {t('moltbook.search.postsOnly')}
              </button>
              <button
                className={`quick-action-btn ${searchType === 'comments' ? 'active' : ''}`}
                onClick={() => setSearchType('comments')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                💬 {t('moltbook.search.commentsOnly')}
              </button>
            </div>
          </div>

          <div className="section-divider" />

          <div className="filter-section" style={{ marginBottom: 0 }}>
            <button className="btn-small btn-block" onClick={handleSearch}>
              🔍 {t('moltbook.search.button')}
            </button>
          </div>

          {searched && !loading && (
            <>
              <div className="section-divider" />
              <div className="filter-section" style={{ marginBottom: 0 }}>
                <div className="filter-section-title">{t('moltbook.search.results') || 'Results'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {results.length} {t('moltbook.search.found') || 'found'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Content - Results */}
        <div className="content-area">
          {loading && <Loading message={t('moltbook.search.searching')} />}

          {error && <EmptyState icon="❌" message={`${t('moltbook.search.failed')}: ${error}`} />}

          {!loading && !error && !searched && (
            <div className="empty-state" style={{ padding: '48px' }}>
              <div className="empty-state-icon">🔍</div>
              <p style={{ color: 'var(--text-secondary)' }}>{t('moltbook.search.hint') || 'Enter a search query to find posts and comments'}</p>
            </div>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <EmptyState icon="🔍" message={t('moltbook.search.noResults')} />
          )}

          {!loading && !error && results.length > 0 && (
            <div>
              {results.map((result, index) => (
                <FeedItem key={index} searchResult={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
