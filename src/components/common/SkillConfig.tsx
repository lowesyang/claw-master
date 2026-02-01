import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { StatusMessage } from './StatusMessage'
import { Select } from './Select'
import { PlatformSkill } from '../../types'
import { useAgentSkill } from '../../hooks/useAgentSkill'

interface SkillConfigProps {
  platform: 'moltbook' | 'clawnews'
  agentName?: string
  isLoggedIn: boolean
}

export function SkillConfig({ platform, agentName: _agentName, isLoggedIn }: SkillConfigProps) {
  const { t } = useLanguage()
  const { config, setConfig, isRunning, startAgent, stopAgent } = useAgentSkill(platform)

  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleToggle = (key: keyof PlatformSkill) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleIntervalChange = (value: number) => {
    setConfig(prev => ({ ...prev, heartbeatInterval: value }))
  }

  const handleStartAgent = async () => {
    if (!isLoggedIn) {
      setStatus({ message: t('skill.loginRequired'), type: 'error' })
      return
    }

    startAgent()
    setStatus({ message: t('skill.agentStarted'), type: 'success' })
  }

  const handleStopAgent = () => {
    stopAgent()
    setStatus({ message: t('skill.agentStopped'), type: 'success' })
  }

  const platformInfo = {
    moltbook: {
      name: 'Moltbook',
      emoji: '🦞',
      color: 'var(--accent)',
    },
    clawnews: {
      name: 'ClawNews',
      emoji: '📰',
      color: 'var(--accent)',
    },
  }

  const info = platformInfo[platform]

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{t('skill.title')}</span>
        {isRunning && (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            borderRadius: '12px',
            fontWeight: 500,
          }}>
            {t('skill.running')}
          </span>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
        {t('skill.description')}
      </p>

      {/* Skill URL */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-main)',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {t('skill.skillUrl')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{
            flex: 1,
            fontSize: '0.85rem',
            color: info.color,
            wordBreak: 'break-all'
          }}>
            {config.skillUrl}
          </code>
          <a
            href={config.skillUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-small btn-secondary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {t('skill.view')}
          </a>
        </div>
        {config.heartbeatUrl && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('skill.heartbeatUrl')}
            </div>
            <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {config.heartbeatUrl}
            </code>
          </div>
        )}
      </div>

      {/* Action Configurations */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '12px' }}>
          {t('skill.actionConfig')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '8px 12px',
            background: config.autoComment ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-main)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}>
            <input
              type="checkbox"
              checked={config.autoComment}
              onChange={() => handleToggle('autoComment')}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{t('skill.autoComment')}</span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('skill.autoCommentDesc')}
              </span>
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '8px 12px',
            background: config.autoUpvote ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-main)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}>
            <input
              type="checkbox"
              checked={config.autoUpvote}
              onChange={() => handleToggle('autoUpvote')}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{t('skill.autoUpvote')}</span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('skill.autoUpvoteDesc')}
              </span>
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '8px 12px',
            background: config.autoPost ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-main)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}>
            <input
              type="checkbox"
              checked={config.autoPost}
              onChange={() => handleToggle('autoPost')}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{t('skill.autoPost')}</span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('skill.autoPostDesc')}
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Heartbeat Interval */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>{t('skill.heartbeatInterval')}</label>
        <Select
          value={String(config.heartbeatInterval)}
          onChange={(val) => handleIntervalChange(Number(val))}
          options={[
            { value: '1', label: `1 ${t('skill.hour')}` },
            { value: '2', label: `2 ${t('skill.hours')}` },
            { value: '4', label: `4 ${t('skill.hours')} (${t('skill.recommended')})` },
            { value: '6', label: `6 ${t('skill.hours')}` },
            { value: '12', label: `12 ${t('skill.hours')}` },
            { value: '24', label: `24 ${t('skill.hours')}` },
          ]}
        />
      </div>

      {status && <StatusMessage message={status.message} type={status.type} />}

      {/* Start/Stop Button */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {!isRunning ? (
          <button
            className="btn-block"
            onClick={handleStartAgent}
            disabled={!isLoggedIn}
            style={{
              background: isLoggedIn ? `linear-gradient(135deg, ${info.color} 0%, var(--accent) 100%)` : 'var(--bg-card)',
              opacity: isLoggedIn ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            {t('skill.startAgent')}
          </button>
        ) : (
          <button
            className="btn-block btn-secondary"
            onClick={handleStopAgent}
            style={{
              borderColor: 'var(--error)',
              color: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
            {t('skill.stopAgent')}
          </button>
        )}
      </div>

      {/* Last Heartbeat */}
      {config.lastHeartbeat && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t('skill.lastHeartbeat')}: {new Date(config.lastHeartbeat).toLocaleString()}
        </div>
      )}

      {!isLoggedIn && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          💡 {t('skill.loginHint')}
        </div>
      )}
    </div>
  )
}
