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
    setStatus({ type: 'info', message: t('auth.verifying') })

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
          {t('clawnch.setup.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
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

      {/* Current Agent */}
      {currentAgentId && (
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          border: '1px solid var(--glass-border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 8px 24px rgba(131, 83, 255, 0.3)',
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                {agentName || t('clawnch.setup.currentAgent')}
              </div>
              <div style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                marginTop: '4px',
              }}>
                {t('clawnch.setup.moltbookKey')}: {showKey ? moltbookKey : '••••••••'}
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    marginLeft: '10px',
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {showKey ? t('auth.hideApiKey') : t('auth.showApiKey')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.3rem' }}>➕</span>
          {t('clawnch.setup.addAgent')}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          {t('clawnch.setup.addAgentDesc')}
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('clawnch.setup.agentName')}
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder={t('clawnch.setup.agentNamePlaceholder')}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            {t('clawnch.setup.agentNameHint')}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('clawnch.setup.moltbookApiKey')} *
          </label>
          <input
            type={showKey ? 'text' : 'password'}
            value={moltbookKey}
            onChange={(e) => setMoltbookKey(e.target.value)}
            placeholder={t('clawnch.setup.enterMoltbookKey')}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            {t('clawnch.setup.moltbookKeyHint')}
            <a 
              href="https://www.moltbook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--color-purple)', marginLeft: '4px' }}
            >
              moltbook.com
            </a>
          </p>
        </div>

        <button
          onClick={handleAddAgent}
          disabled={isVerifying}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isVerifying ? 'not-allowed' : 'pointer',
            opacity: isVerifying ? 0.7 : 1,
          }}
        >
          {isVerifying ? t('auth.verifying') : t('clawnch.setup.addButton')}
        </button>
      </div>

      {/* Saved Agents List */}
      {savedAgents.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>📋</span>
            {t('clawnch.setup.savedAgents')}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {savedAgents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  padding: '16px',
                  background: agent.id === currentAgentId ? 'rgba(131, 83, 255, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${agent.id === currentAgentId ? 'rgba(131, 83, 255, 0.3)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {agent.name}
                    {agent.id === currentAgentId && (
                      <span style={{
                        marginLeft: '10px',
                        padding: '2px 8px',
                        background: 'var(--color-purple)',
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
                    {t('clawnch.setup.addedAt')}: {new Date(agent.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {agent.id !== currentAgentId && (
                    <button
                      onClick={() => handleSwitchAgent(agent.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t('clawnch.setup.switch')}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAgent(agent.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(247, 93, 95, 0.1)',
                      border: '1px solid var(--error)',
                      borderRadius: '8px',
                      color: 'var(--error)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {t('clawnch.setup.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{
        marginTop: '28px',
        padding: '20px',
        background: 'rgba(57, 158, 247, 0.08)',
        border: '1px solid var(--info)',
        borderRadius: '12px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--info)' }}>
              {t('clawnch.setup.infoTitle')}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('clawnch.setup.infoText')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
