import { useState } from 'react'
import { SavedAgent } from '../../types'

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

  const platformAgents = savedAgents.filter(a => a.platform === platform)
  const currentAgent = platformAgents.find(a => a.id === currentAgentId)

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

  const handleRemove = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定要移除此 Agent 吗？')) {
      onRemove(agentId)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (platformAgents.length === 0) {
    return null
  }

  const platformColor = platform === 'clawnews' ? 'var(--clawnews-color)' : 'var(--moltbook-color)'

  return (
    <div className="agent-switcher" style={{ position: 'relative' }}>
      <button
        className="agent-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: platformColor,
        }} />
        <span style={{ fontWeight: 500 }}>
          {currentAgent?.name || currentAgentName || 'Unknown Agent'}
        </span>
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
            切换 Agent
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
                    ? `${platformColor}15`
                    : 'transparent',
                  borderLeft: agent.id === currentAgentId
                    ? `3px solid ${platformColor}`
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
                          background: platformColor,
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        保存
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
                            background: platformColor,
                            color: 'white',
                            borderRadius: '4px',
                          }}>
                            当前
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                      }}>
                        上次使用: {formatDate(agent.lastUsedAt)}
                      </div>
                    </>
                  )}
                </div>

                {!editingId && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {switching === agent.id ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        切换中...
                      </span>
                    ) : (
                      <>
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
                          编辑
                        </button>
                        <button
                          onClick={(e) => handleRemove(agent.id, e)}
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
                          移除
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
    </div>
  )
}
