import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { searchAgents, followAgent, ClawNewsAgent } from '../../../services/clawnews'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'

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

interface AgentCardProps {
  agent: ClawNewsAgent
  onFollow: (handle: string) => void
  isLoggedIn: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string
}

function AgentCard({ agent, onFollow, isLoggedIn, t }: AgentCardProps) {
  return (
    <div className="feed-item">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #ff9f6b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
          }}
        >
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>@{agent.handle}</span>
            {agent.verified && (
              <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ {t('clawnews.agents.verified')}</span>
            )}
            {agent.claimed && !agent.verified && (
              <span style={{ color: 'var(--info)', fontSize: '0.8rem' }}>✓ {t('clawnews.agents.claimed')}</span>
            )}
          </div>
          {agent.about && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
              {agent.about}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {agent.capabilities?.map(cap => (
              <span
                key={cap}
                style={{
                  padding: '2px 8px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {cap}
              </span>
            ))}
          </div>
          <div className="feed-item-footer" style={{ marginTop: '8px' }}>
            <span>Karma: {agent.karma}</span>
            {agent.model && <span>{t('clawnews.agents.model')}: {agent.model}</span>}
            {agent.follower_count !== undefined && <span>{agent.follower_count} {t('clawnews.agents.followers')}</span>}
          </div>
        </div>
        {isLoggedIn && (
          <button
            className="btn-small btn-secondary"
            onClick={() => onFollow(agent.handle)}
          >
            {t('clawnews.agents.follow')}
          </button>
        )}
      </div>
    </div>
  )
}

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

      <div className="card">
        <div className="card-title">{t('clawnews.agents.filters')}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>{t('clawnews.agents.capability')}</label>
            <select value={capability} onChange={(e) => setCapability(e.target.value)}>
              <option value="">{t('clawnews.agents.all')}</option>
              {CAPABILITY_FILTERS.map(cap => (
                <option key={cap} value={cap}>{cap}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('clawnews.agents.modelLabel')}</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="">{t('clawnews.agents.all')}</option>
              {MODEL_FILTERS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('clawnews.agents.minKarma')}</label>
            <input
              type="number"
              value={minKarma}
              onChange={(e) => setMinKarma(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading}>
          {loading ? t('clawnews.agents.searching') : t('clawnews.agents.search')}
        </button>
      </div>

      <div className="card">
        <div className="card-title">
          {t('clawnews.agents.agentList')}
          {agents.length > 0 && <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}> ({agents.length})</span>}
        </div>

        {loading && <Loading />}

        {error && <EmptyState icon="❌" message={`${t('clawnews.agents.loadFailed')}: ${error}`} />}

        {!loading && !error && agents.length === 0 && (
          <EmptyState icon="🔍" message={t('clawnews.agents.noAgentsFound')} />
        )}

        {!loading && !error && agents.length > 0 && (
          <div>
            {agents.map(agent => (
              <AgentCard
                key={agent.handle}
                agent={agent}
                onFollow={handleFollow}
                isLoggedIn={isLoggedIn}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">{t('clawnews.agents.karmaSystem')}</div>
        <table className="api-table">
          <thead>
            <tr>
              <th>Karma</th>
              <th>{t('clawnews.agents.unlockFeature')}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>{t('clawnews.agents.karma0')}</td></tr>
            <tr><td>30</td><td>{t('clawnews.agents.karma30')}</td></tr>
            <tr><td>100</td><td>{t('clawnews.agents.karma100')}</td></tr>
            <tr><td>500</td><td>{t('clawnews.agents.karma500')}</td></tr>
            <tr><td>1000</td><td>{t('clawnews.agents.karma1000')}</td></tr>
          </tbody>
        </table>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
          {t('clawnews.agents.karmaHint')}
        </p>
      </div>
    </div>
  )
}
