import { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { Loading } from '../../common/Loading'

// 直接调用 Clawnch API（纯前端调用）
const CLAWNCH_API_BASE = 'https://clawn.ch'

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
      // 使用 /api/launches 获取完整的代币信息
      const response = await fetch(`${CLAWNCH_API_BASE}/api/launches?limit=50`)
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
        <div style={{ display: 'grid', gap: '16px' }}>
          {tokens.map((token) => (
            <div
              key={token.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-purple)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                {/* Token Image */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.15) 0%, rgba(197, 57, 249, 0.15) 100%)',
                  border: '1px solid rgba(131, 83, 255, 0.2)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
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
                          // Hide fallback emoji when image loads
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'none'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          console.error('Failed to load token image:', token.image)
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 1 }}>🪙</span>
                    </>
                  ) : (
                    <span>🪙</span>
                  )}
                </div>

                {/* Token Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {token.name}
                    </h3>
                    <span style={{
                      padding: '4px 10px',
                      background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.15) 0%, rgba(197, 57, 249, 0.15) 100%)',
                      border: '1px solid rgba(131, 83, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-purple)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      ${token.symbol}
                    </span>
                  </div>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    marginBottom: '12px',
                  }}>
                    {token.description}
                  </p>

                  {/* Debug: Show image URL */}
                  {token.image && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginBottom: '12px',
                      wordBreak: 'break-all',
                    }}>
                      🖼️ Image: {token.image}
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    marginBottom: '12px',
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t('clawnch.tokens.agent')}:
                      </span>{' '}
                      {token.agentName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t('clawnch.tokens.launched')}:
                      </span>{' '}
                      {formatDate(token.launchedAt)}
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {token.clankerUrl && (
                      <a
                        href={token.clankerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 14px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-purple)'
                          e.currentTarget.style.background = 'rgba(131, 83, 255, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.background = 'var(--bg-secondary)'
                        }}
                      >
                        🦀 Clanker
                      </a>
                    )}
                    {token.contractAddress && (
                      <a
                        href={`https://basescan.org/token/${token.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 14px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--info)'
                          e.currentTarget.style.background = 'rgba(57, 158, 247, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.background = 'var(--bg-secondary)'
                        }}
                      >
                        🔍 BaseScan
                      </a>
                    )}
                    {token.postUrl && (
                      <a
                        href={token.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 14px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--moltbook-color)'
                          e.currentTarget.style.background = 'rgba(240, 136, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.background = 'var(--bg-secondary)'
                        }}
                      >
                        🦞 Source Post
                      </a>
                    )}
                  </div>

                  {/* Token Address */}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    borderRadius: '8px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: 'var(--text-tertiary)',
                    wordBreak: 'break-all',
                  }}>
                    {token.contractAddress}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
