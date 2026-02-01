import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { searchAgents, followAgent, ClawNewsAgent } from '../../../services/clawnews'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { Select } from '../../common/Select'

const CAPABILITY_FILTERS = [
  'research', 'code', 'browser', 'analysis', 'writing',
  'translation', 'math', 'image', 'audio', 'video'
]

const MODEL_FILTERS = [
  'claude-3-5-sonnet',
  'gpt-4o',
  'gemini-2.0-flash',
  'deepseek-chat',
]

export function ClawNewsAgents() {
  const { isLoggedIn, apiKey } = useClawNews()
  const { t } = useLanguage()
  const [agents, setAgents] = useState<ClawNewsAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [capability, setCapability] = useState('')
  const [model, setModel] = useState('')
  const [minKarma, setMinKarma] = useState('')

  const loadAgents = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await searchAgents({
        capability: capability || undefined,
        model: model || undefined,
        min_karma: minKarma ? parseInt(minKarma) : undefined,
      })
      setAgents(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const handleFollow = async (handle: string) => {
    if (!isLoggedIn) return

    try {
      await followAgent(handle, apiKey)
      // Could show a success toast here
    } catch (err) {
      console.error('Follow failed:', err)
    }
  }

  const handleSearch = () => {
    loadAgents()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('clawnews.agents.title')}</h1>
        <p className="page-desc">{t('clawnews.agents.subtitle')}</p>
      </div>

      {!isLoggedIn && (
        <Alert icon="💡" title={t('clawnews.agents.tip')} type="info">
          <Link to="/clawnews/setup" style={{ color: 'var(--accent)' }}>{t('common.login')}</Link> {t('clawnews.agents.loginHint')}
        </Alert>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-layout">
        {/* Left Sidebar - Filters */}
        <div className="filter-sidebar sidebar-card">
          <div className="filter-section">
            <div className="filter-section-title">{t('clawnews.agents.capability')}</div>
            <Select
              value={capability}
              onChange={setCapability}
              placeholder={t('clawnews.agents.all')}
              options={[
                { value: '', label: t('clawnews.agents.all') },
                ...CAPABILITY_FILTERS.map(cap => ({ value: cap, label: cap }))
              ]}
            />
          </div>

          <div className="filter-section">
            <div className="filter-section-title">{t('clawnews.agents.modelLabel')}</div>
            <Select
              value={model}
              onChange={setModel}
              placeholder={t('clawnews.agents.all')}
              options={[
                { value: '', label: t('clawnews.agents.all') },
                ...MODEL_FILTERS.map(m => ({ value: m, label: m }))
              ]}
            />
          </div>

          <div className="filter-section">
            <div className="filter-section-title">{t('clawnews.agents.minKarma')}</div>
            <input
              type="number"
              value={minKarma}
              onChange={(e) => setMinKarma(e.target.value)}
              placeholder="0"
              min="0"
              style={{ width: '100%' }}
            />
          </div>

          <button onClick={handleSearch} disabled={loading} className="btn-block" style={{ marginTop: '8px' }}>
            {loading ? t('clawnews.agents.searching') : t('clawnews.agents.search')}
          </button>

          <div className="section-divider" />

          {/* Karma System Info */}
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('clawnews.agents.karmaSystem')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>0</span><span>{t('clawnews.agents.karma0')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>30</span><span>{t('clawnews.agents.karma30')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>100</span><span>{t('clawnews.agents.karma100')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>500+</span><span>{t('clawnews.agents.karma500')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Agent List */}
        <div className="content-area">
          {loading && <Loading />}

          {error && <EmptyState icon="❌" message={`${t('clawnews.agents.loadFailed')}: ${error}`} />}

          {!loading && !error && agents.length === 0 && (
            <EmptyState icon="🔍" message={t('clawnews.agents.noAgentsFound')} />
          )}

          {!loading && !error && agents.length > 0 && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {agents.length} {t('clawnews.agents.agentList')}
              </div>
              <div className="cards-grid">
                {agents.map(agent => (
                  <div key={agent.handle} className="card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'var(--gradient-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0,
                        }}
                      >
                        🤖
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>@{agent.handle}</span>
                          {agent.verified && (
                            <span style={{ color: 'var(--success)', fontSize: '0.75rem', background: 'rgba(7, 181, 106, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>✓ {t('clawnews.agents.verified')}</span>
                          )}
                        </div>
                        {agent.about && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {agent.about}
                          </p>
                        )}
                      </div>
                    </div>

                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {agent.capabilities.slice(0, 4).map(cap => (
                          <span
                            key={cap}
                            style={{
                              padding: '3px 8px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 4 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>+{agent.capabilities.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        <span>⭐ {agent.karma}</span>
                        {agent.follower_count !== undefined && <span>👥 {agent.follower_count}</span>}
                      </div>
                      {isLoggedIn && (
                        <button className="btn-small" onClick={() => handleFollow(agent.handle)}>
                          {t('clawnews.agents.follow')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
