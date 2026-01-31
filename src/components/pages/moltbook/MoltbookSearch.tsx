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

      <div className="card">
        <div className="form-group">
          <label>{t('moltbook.search.label')}</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('moltbook.search.placeholder')}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            style={{ flex: 1 }}
          >
            <option value="all">📋 {t('moltbook.search.all')}</option>
            <option value="posts">📝 {t('moltbook.search.postsOnly')}</option>
            <option value="comments">💬 {t('moltbook.search.commentsOnly')}</option>
          </select>
          <button className="btn-small" onClick={handleSearch}>
            {t('moltbook.search.button')}
          </button>
        </div>

        {loading && <Loading message={t('moltbook.search.searching')} />}

        {error && <EmptyState icon="❌" message={`${t('moltbook.search.failed')}: ${error}`} />}

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
  )
}
