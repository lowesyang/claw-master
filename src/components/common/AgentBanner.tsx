import { useNavigate } from 'react-router-dom'
import { Agent } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAgentSkill } from '../../hooks/useAgentSkill'

interface AgentBannerProps {
  agent: Agent
  platform?: 'moltbook' | 'clawnews'
  showSettingsButton?: boolean
  showStartButton?: boolean
  settingsPath?: string
}

export function AgentBanner({ 
  agent, 
  platform = 'moltbook',
  showSettingsButton = false, 
  showStartButton = false,
  settingsPath = '/moltbook/setup' 
}: AgentBannerProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isRunning, toggleAgent } = useAgentSkill(platform)

  const displayName = agent.is_claimed
    ? agent.name
    : `${agent.name} (${t('agent.unclaimed')})`

  const status = agent.is_claimed
    ? t('agent.verified')
    : t('agent.pending')

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '28px',
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      transition: 'all 0.3s ease',
    }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--gradient-primary)',
      }} />

      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        boxShadow: '0 8px 24px rgba(131, 83, 255, 0.25)',
        flexShrink: 0,
      }}>
        🤖
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: '1.2rem',
          letterSpacing: '-0.3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {displayName}
          {isRunning && (
            <span style={{
              fontSize: '0.7rem',
              padding: '3px 8px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              borderRadius: '10px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#22c55e',
                animation: 'pulse 2s infinite',
              }} />
              {t('agent.running')}
            </span>
          )}
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          display: 'flex',
          gap: '20px',
          marginTop: '6px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {status}
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-purple)',
            fontWeight: 600,
          }}>
            ⭐ Karma: {agent.karma || 0}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {showStartButton && (
          <button
            onClick={toggleAgent}
            title={isRunning ? t('agent.stopAgent') : t('agent.startAgent')}
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              border: `1px solid ${isRunning ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              borderRadius: '10px',
              color: isRunning ? '#ef4444' : '#22c55e',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'
            }}
          >
            {isRunning ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                {t('agent.stop')}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
                {t('agent.start')}
              </>
            )}
          </button>
        )}
        
        {showSettingsButton && (
          <button
            type="button"
            onClick={() => navigate(settingsPath)}
            title={t('common.settings')}
            aria-label={t('common.settings')}
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              minHeight: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-hover)'
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <span style={{ fontSize: '1.15rem', lineHeight: 1 }} aria-hidden>⚙️</span>
          </button>
        )}
      </div>
    </div>
  )
}
