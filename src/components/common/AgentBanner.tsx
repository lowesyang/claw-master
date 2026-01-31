import { useNavigate } from 'react-router-dom'
import { Agent } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'

interface AgentBannerProps {
  agent: Agent
  showSettingsButton?: boolean
  settingsPath?: string
}

export function AgentBanner({ agent, showSettingsButton = false, settingsPath = '/moltbook/setup' }: AgentBannerProps) {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const displayName = agent.is_claimed
    ? agent.name
    : `${agent.name} (${language === 'zh' ? '未认领' : 'Unclaimed'})`

  const status = agent.is_claimed
    ? (language === 'zh' ? '✅ 已验证' : '✅ Verified')
    : (language === 'zh' ? '⏳ 待验证' : '⏳ Pending')

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
        }}>
          {displayName}
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

      {showSettingsButton && (
        <button
          onClick={() => navigate(settingsPath)}
          style={{
            padding: '10px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)'
            e.currentTarget.style.borderColor = 'var(--color-purple)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          {language === 'zh' ? '设置' : 'Settings'}
        </button>
      )}
    </div>
  )
}
