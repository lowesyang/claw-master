import { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { StatusMessage } from '../../common/StatusMessage'
import { apiRequest } from '../../../services/api'

interface MoltbookAgent {
  handle: string
  display_name?: string
}

interface SavedAgent {
  id: string
  name: string
  handle: string
  moltbookKey: string
  addedAt: string
}

export function ClawnchSetup() {
  const { t } = useLanguage()
  const [moltbookKey, setMoltbookKey] = useState('')
  const [agentName, setAgentName] = useState('')
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([])
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  // Load saved agents on mount
  useEffect(() => {
    const stored = localStorage.getItem('clawnch_agents')
    if (stored) {
      try {
        const agents = JSON.parse(stored)
        setSavedAgents(agents)
        if (agents.length > 0) {
          setCurrentAgentId(agents[0].id)
          setMoltbookKey(agents[0].moltbookKey)
          setAgentName(agents[0].name)
        }
      } catch (e) {
        console.error('Failed to load agents:', e)
      }
    }
  }, [])

  const [isVerifying, setIsVerifying] = useState(false)

  const handleAddAgent = async () => {
    if (!moltbookKey.trim()) {
      setStatus({ type: 'error', message: t('clawnch.setup.enterMoltbookKey') })
      return
    }

    setIsVerifying(true)
    setStatus(null)

    try {
      // 验证 Moltbook API Key
      const data = await apiRequest<{ agent?: MoltbookAgent }>('/agents/me', {}, moltbookKey.trim())

      if (!data.agent) {
        throw new Error('Invalid API key')
      }

      const newAgent: SavedAgent = {
        id: Date.now().toString(),
        name: agentName.trim() || data.agent.display_name || data.agent.handle || `Agent ${savedAgents.length + 1}`,
        handle: data.agent.handle,
        moltbookKey: moltbookKey.trim(),
        addedAt: new Date().toISOString(),
      }

      const updated = [...savedAgents, newAgent]
      setSavedAgents(updated)
      localStorage.setItem('clawnch_agents', JSON.stringify(updated))

      setCurrentAgentId(newAgent.id)
      setStatus({ type: 'success', message: `${t('clawnch.setup.agentAdded')}: @${data.agent.handle}` })
      setAgentName('')
      setMoltbookKey('')
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('auth.connectionFailed')
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSwitchAgent = (id: string) => {
    const agent = savedAgents.find(a => a.id === id)
    if (agent) {
      setCurrentAgentId(id)
      setMoltbookKey(agent.moltbookKey)
      setAgentName(agent.name)
      setStatus({ type: 'success', message: `${t('clawnch.setup.switched')} ${agent.name}` })
    }
  }

  const handleRemoveAgent = (id: string) => {
    if (confirm(t('clawnch.setup.confirmRemove'))) {
      const updated = savedAgents.filter(a => a.id !== id)
      setSavedAgents(updated)
      localStorage.setItem('clawnch_agents', JSON.stringify(updated))

      if (currentAgentId === id) {
        if (updated.length > 0) {
          setCurrentAgentId(updated[0].id)
          setMoltbookKey(updated[0].moltbookKey)
          setAgentName(updated[0].name)
        } else {
          setCurrentAgentId(null)
          setMoltbookKey('')
          setAgentName('')
        }
      }

      setStatus({ type: 'success', message: t('clawnch.setup.agentRemoved') })
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          {t('clawnch.setup.title')}
        </h1>
        <p className="page-desc">
          {t('clawnch.setup.subtitle')}
        </p>
      </div>

      {status && (
        <StatusMessage
          type={status.type}
          message={status.message}
          onClose={() => setStatus(null)}
        />
      )}

      {/* Current Agent Banner */}
      {currentAgentId && (
        <div className="agent-banner">
          <div className="agent-avatar">🤖</div>
          <div className="agent-details">
            <div className="agent-name">
              {agentName || t('clawnch.setup.currentAgent')}
            </div>
            <div className="agent-meta">
              <span>{t('clawnch.setup.moltbookKey')}: {showKey ? moltbookKey : '••••••••'}</span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="btn-small btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                {showKey ? t('auth.hideApiKey') : t('auth.showApiKey')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout">
        {/* Left Column - Add Agent Form */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">
              <span style={{ fontSize: '1.3rem' }}>➕</span>
              {t('clawnch.setup.addAgent')}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {t('clawnch.setup.addAgentDesc')}
            </p>

            <div className="form-group">
              <label>{t('clawnch.setup.agentName')}</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder={t('clawnch.setup.agentNamePlaceholder')}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                {t('clawnch.setup.agentNameHint')}
              </p>
            </div>

            <div className="form-group">
              <label>{t('clawnch.setup.moltbookApiKey')} *</label>
              <input
                type={showKey ? 'text' : 'password'}
                value={moltbookKey}
                onChange={(e) => setMoltbookKey(e.target.value)}
                placeholder={t('clawnch.setup.enterMoltbookKey')}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                {t('clawnch.setup.moltbookKeyHint')}
                <a
                  href="https://www.moltbook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', marginLeft: '4px' }}
                >
                  moltbook.com
                </a>
              </p>
            </div>

            <button
              onClick={handleAddAgent}
              disabled={isVerifying}
              className="btn-block"
              style={{
                opacity: isVerifying ? 0.7 : 1,
                cursor: isVerifying ? 'not-allowed' : 'pointer',
              }}
            >
              {isVerifying ? t('clawnch.setup.adding') : t('clawnch.setup.addAgent')}
            </button>
          </div>

          {/* Info Box */}
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <div className="alert-content">
              <div className="alert-title">{t('clawnch.setup.infoTitle')}</div>
              <div className="alert-text">{t('clawnch.setup.infoText')}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Saved Agents List */}
        <div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">
              <span style={{ fontSize: '1.3rem' }}>📋</span>
              {t('clawnch.setup.savedAgents')}
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.85rem',
                fontWeight: 400,
                color: 'var(--text-tertiary)',
              }}>
                {savedAgents.length} {savedAgents.length === 1 ? 'agent' : 'agents'}
              </span>
            </div>

            {savedAgents.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <div className="empty-state-icon">🤖</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {t('clawnch.setup.noAgents') || 'No agents added yet'}
                </p>
              </div>
            ) : (
              <div className="cards-grid compact" style={{ gridTemplateColumns: '1fr' }}>
                {savedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="card-compact"
                    style={{
                      padding: '16px',
                      background: agent.id === currentAgentId ? 'rgba(131, 83, 255, 0.08)' : 'var(--bg-secondary)',
                      border: `1px solid ${agent.id === currentAgentId ? 'rgba(131, 83, 255, 0.3)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: agent.id === currentAgentId
                          ? 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)'
                          : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}>
                        🤖
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {agent.name}
                          {agent.id === currentAgentId && (
                            <span style={{
                              padding: '2px 8px',
                              background: 'var(--accent)',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}>
                              {t('clawnch.setup.current')}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                          @{agent.handle} • {new Date(agent.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {agent.id !== currentAgentId && (
                        <button
                          onClick={() => handleSwitchAgent(agent.id)}
                          className="btn-small btn-secondary"
                          style={{ flex: 1 }}
                        >
                          {t('clawnch.setup.switch')}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAgent(agent.id)}
                        className="btn-small"
                        style={{
                          flex: agent.id === currentAgentId ? 1 : 'none',
                          background: 'rgba(247, 93, 95, 0.1)',
                          border: '1px solid var(--error)',
                          color: 'var(--error)',
                        }}
                      >
                        {t('clawnch.setup.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
