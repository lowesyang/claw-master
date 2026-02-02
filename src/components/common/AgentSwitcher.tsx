import { useState, useEffect, useRef } from 'react'
import { SavedAgent } from '../../types'
import { useAgentSkill } from '../../hooks/useAgentSkill'
import { useLanguage } from '../../contexts/LanguageContext'

// Avatar component with fallback
function AgentAvatar({ url, name, size = 32 }: { url?: string; name: string; size?: number }) {
  const [imgError, setImgError] = useState(false)
  
  // Reset error state when URL changes
  useEffect(() => {
    setImgError(false)
  }, [url])
  
  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          objectFit: 'cover',
          flexShrink: 0,
        }}
        onError={() => setImgError(true)}
      />
    )
  }
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.25,
      background: 'var(--gradient-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.5,
      flexShrink: 0,
    }}>
      🤖
    </div>
  )
}

interface AgentSwitcherProps {
  savedAgents: SavedAgent[]
  currentAgentId: string | null
  currentAgentName?: string
  platform: 'moltbook' | 'clawnews'
  onSwitch: (agentId: string) => Promise<void>
  onRemove: (agentId: string) => void
  onUpdateName: (agentId: string, name: string) => void
}

export function AgentSwitcher({
  savedAgents,
  currentAgentId,
  currentAgentName,
  platform,
  onSwitch,
  onRemove,
  onUpdateName,
}: AgentSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removeConfirm, setRemoveConfirm] = useState<SavedAgent | null>(null)
  const { isRunning, toggleAgent, clearConfig } = useAgentSkill(platform)
  const { t, language } = useLanguage()
  const autoSwitchingRef = useRef(false)

  const platformAgents = savedAgents.filter(a => a.platform === platform)
  const currentAgent = platformAgents.find(a => a.id === currentAgentId)

  // Auto-select first platform agent if no current agent is selected
  useEffect(() => {
    if (platformAgents.length > 0 && !currentAgent && !autoSwitchingRef.current) {
      autoSwitchingRef.current = true
      onSwitch(platformAgents[0].id).finally(() => {
        autoSwitchingRef.current = false
      })
    }
  }, [platformAgents, currentAgent, onSwitch])

  const handleSwitch = async (agentId: string) => {
    if (agentId === currentAgentId) {
      setIsOpen(false)
      return
    }

    setSwitching(agentId)
    setError(null)
    try {
      await onSwitch(agentId)
      setIsOpen(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSwitching(null)
    }
  }

  const handleStartEdit = (agent: SavedAgent) => {
    setEditingId(agent.id)
    setEditName(agent.name)
  }

  const handleSaveEdit = (agentId: string) => {
    if (editName.trim()) {
      onUpdateName(agentId, editName.trim())
    }
    setEditingId(null)
  }

  const handleRemoveClick = (agent: SavedAgent, e: React.MouseEvent) => {
    e.stopPropagation()
    setRemoveConfirm(agent)
  }

  const handleConfirmRemove = () => {
    if (!removeConfirm) return

    // If removing current agent, stop it and clear config first
    if (removeConfirm.id === currentAgentId) {
      clearConfig()
    }

    onRemove(removeConfirm.id)
    setRemoveConfirm(null)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const locale = language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (platformAgents.length === 0) {
    return null
  }

  const accentColor = 'var(--accent)'

  return (
    <div className="agent-switcher" style={{ position: 'relative' }}>
      <button
        className="agent-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        }}
      >
        <AgentAvatar 
          url={currentAgent?.avatarUrl} 
          name={currentAgent?.name || currentAgentName || 'Agent'} 
          size={28}
        />
        <span style={{ fontWeight: 500 }}>
          {currentAgent?.name || currentAgentName || 'Unknown Agent'}
        </span>
        {isRunning && (
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            borderRadius: '4px',
          }}>
            {t('agent.running')}
          </span>
        )}
        <span style={{
          marginLeft: '4px',
          opacity: 0.5,
          fontSize: '0.75rem',
        }}>
          ({platformAgents.length} agents)
        </span>
        <span style={{
          marginLeft: 'auto',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="agent-switcher-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            minWidth: '320px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {t('agentSwitcher.switchAgent')}
          </div>

          {error && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255, 100, 100, 0.1)',
              color: 'var(--error)',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {platformAgents.map(agent => (
              <div
                key={agent.id}
                onClick={() => !editingId && handleSwitch(agent.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: editingId ? 'default' : 'pointer',
                  background: agent.id === currentAgentId
                    ? 'var(--accent-light)'
                    : 'transparent',
                  borderLeft: agent.id === currentAgentId
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (agent.id !== currentAgentId && !editingId) {
                    e.currentTarget.style.background = 'var(--bg-card-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (agent.id !== currentAgentId) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <AgentAvatar url={agent.avatarUrl} name={agent.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === agent.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(agent.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          background: 'var(--bg-main)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveEdit(agent.id) }}
                        style={{
                          padding: '4px 8px',
                          background: accentColor,
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}>
                        {agent.name}
                        {agent.handle && (
                          <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 400,
                          }}>
                            @{agent.handle}
                          </span>
                        )}
                        {agent.id === currentAgentId && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            background: accentColor,
                            color: 'white',
                            borderRadius: '4px',
                          }}>
                            {t('agentSwitcher.current')}
                          </span>
                        )}
                        {agent.id === currentAgentId && isRunning && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}>
                            <span style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: '#22c55e',
                            }} />
                            {t('agent.running')}
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                      }}>
                        {t('agentSwitcher.lastUsed')}: {formatDate(agent.lastUsedAt)}
                      </div>
                    </>
                  )}
                </div>

                {!editingId && (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {switching === agent.id ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {t('agentSwitcher.switching')}
                      </span>
                    ) : (
                      <>
                        {agent.id === currentAgentId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleAgent() }}
                            title={isRunning ? t('agent.stopAgent') : t('agent.startAgent')}
                            style={{
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              background: isRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              border: `1px solid ${isRunning ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                              borderRadius: '6px',
                              color: isRunning ? '#ef4444' : '#22c55e',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {isRunning ? (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                  <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                                {t('agent.stop')}
                              </>
                            ) : (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5.14v14l11-7-11-7z" />
                                </svg>
                                {t('agent.start')}
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartEdit(agent) }}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={(e) => handleRemoveClick(agent, e)}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid var(--error)',
                            borderRadius: '4px',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          {t('agentSwitcher.remove')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Remove Confirmation Modal */}
      {removeConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setRemoveConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '10px',
                fontSize: '1.3rem',
              }}>
                ⚠️
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  {t('agentSwitcher.confirmRemoveTitle')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {removeConfirm.name}
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('agentSwitcher.removeWarning')}
              </p>
              <ul style={{
                margin: '10px 0 0',
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: 1.8,
              }}>
                <li>{t('agentSwitcher.removeItem1')}</li>
                <li>{t('agentSwitcher.removeItem2')}</li>
                <li>{t('agentSwitcher.removeItem3')}</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setRemoveConfirm(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmRemove}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'var(--error)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {t('agentSwitcher.confirmRemove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
