import { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { Loading } from '../../common/Loading'

// 所有请求走代理（避免 CORS 问题）
const CLAWNCH_PROXY = '/api/clawnch/proxy'

// API 响应格式（根据 skill.md）
interface Token {
  id: string
  name: string
  symbol: string
  contractAddress: string
  agentWallet: string
  agentName: string
  description: string
  image: string
  postUrl: string
  clankerUrl: string
  launchedAt: string
  source: string
}

export function ClawnchTokens() {
  const { t } = useLanguage()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    setLoading(true)
    setError(null)
    try {
      // 所有请求走代理
      const response = await fetch(`${CLAWNCH_PROXY}?path=${encodeURIComponent('/api/launches?limit=50')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }
      const data = await response.json()
      setTokens(data.launches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return t('clawnch.tokens.today')
    if (days === 1) return t('clawnch.tokens.yesterday')
    if (days < 30) return `${days} ${t('clawnch.tokens.daysAgo')}`

    return date.toLocaleDateString()
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {t('clawnch.tokens.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {t('clawnch.tokens.subtitle')}
        </p>
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={fetchTokens}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🔄</span>
          {t('common.refresh')}
        </button>
      </div>

      {/* Loading State */}
      {loading && <Loading message={t('clawnch.tokens.loading')} />}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          padding: '24px',
          background: 'rgba(247, 93, 95, 0.08)',
          border: '1px solid var(--error)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: 'var(--error)', fontWeight: 600, marginBottom: '8px' }}>
            {t('clawnch.tokens.loadFailed')}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {error}
          </div>
        </div>
      )}

      {/* Tokens List */}
      {!loading && !error && tokens.length === 0 && (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.6 }}>🪙</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {t('clawnch.tokens.noTokens')}
          </div>
        </div>
      )}

      {!loading && !error && tokens.length > 0 && (
        <div className="cards-grid">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="card"
              style={{
                marginBottom: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Token Header */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {/* Token Image */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.15) 0%, rgba(197, 57, 249, 0.15) 100%)',
                  border: '1px solid rgba(131, 83, 255, 0.2)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  position: 'relative',
                }}>
                  {token.image ? (
                    <>
                      <img
                        src={token.image}
                        alt={token.name}
                        crossOrigin="anonymous"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'none'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 1 }}>🪙</span>
                    </>
                  ) : (
                    <span>🪙</span>
                  )}
                </div>

                {/* Token Name & Symbol */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {token.name}
                  </h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.15) 0%, rgba(197, 57, 249, 0.15) 100%)',
                    border: '1px solid rgba(131, 83, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ${token.symbol}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                marginBottom: '12px',
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {token.description}
              </p>

              {/* Stats Grid */}
              <div className="stats-grid" style={{ marginBottom: '12px' }}>
                <div className="stat-item" style={{ padding: '10px' }}>
                  <div className="stat-label">Agent</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {token.agentName}
                  </div>
                </div>
                <div className="stat-item" style={{ padding: '10px' }}>
                  <div className="stat-label">{t('clawnch.tokens.launched')}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {formatDate(token.launchedAt)}
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div style={{
                padding: '8px 10px',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
                marginBottom: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {token.contractAddress}
              </div>

              {/* Links */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
              }}>
                {token.clankerUrl && (
                  <a
                    href={token.clankerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-small btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.8rem' }}
                  >
                    🦀 Clanker
                  </a>
                )}
                {token.contractAddress && (
                  <a
                    href={`https://basescan.org/token/${token.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-small btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.8rem' }}
                  >
                    🔍 Scan
                  </a>
                )}
                {token.postUrl && (
                  <a
                    href={token.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-small btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.8rem' }}
                  >
                    🦞 Post
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
