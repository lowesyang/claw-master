import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { StatusMessage } from '../common/StatusMessage'
import { ModelSelector } from '../common/ModelSelector'

export function Settings() {
  const { t } = useLanguage()
  const { openrouterApiKey, aiModel, setOpenRouterSettings } = useAuth()

  const [orApiKey, setOrApiKey] = useState(openrouterApiKey)
  const [showOrApiKey, setShowOrApiKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState(aiModel)
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Check if settings have changed
  const hasChanges = orApiKey.trim() !== openrouterApiKey || selectedModel !== aiModel
  const canSave = orApiKey.trim() !== '' && hasChanges

  const handleSaveSettings = () => {
    if (!orApiKey.trim()) {
      setStatus({ message: t('settings.enterApiKey'), type: 'error' })
      return
    }
    setOpenRouterSettings(orApiKey.trim(), selectedModel)
    setStatus({ message: `✅ ${t('settings.saved')}`, type: 'success' })
  }

  const handleClearSettings = () => {
    setOrApiKey('')
    setOpenRouterSettings('', selectedModel)
    setStatus({ message: `✅ ${t('settings.cleared')}`, type: 'success' })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ {t('settings.title')}</h1>
        <p className="page-desc">{t('settings.subtitle')}</p>
      </div>

      {/* AI Features Info */}
      <div className="card">
        <div className="card-title">✨ {t('settings.aiFeaturesTitle')}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
          {t('settings.aiFeaturesDesc')}
        </p>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>{t('settings.aiFeature1')}</li>
          <li style={{ marginBottom: '8px' }}>{t('settings.aiFeature2')}</li>
          <li>{t('settings.aiFeature3')}</li>
        </ul>
      </div>

      {/* OpenRouter Settings */}
      <div className="card">
        <div className="card-title">🤖 {t('settings.openrouterTitle')}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          {t('settings.openrouterDesc')}{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            {t('settings.getApiKey')}
          </a>
        </p>

        {status && <StatusMessage message={status.message} type={status.type} />}

        <div className="form-group">
          <label>{t('settings.apiKeyLabel')}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showOrApiKey ? 'text' : 'password'}
              value={orApiKey}
              onChange={(e) => setOrApiKey(e.target.value)}
              placeholder="sk-or-..."
              style={{ paddingRight: '80px' }}
            />
            <button
              type="button"
              className="btn-small btn-secondary"
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '6px 10px' }}
              onClick={() => setShowOrApiKey(!showOrApiKey)}
            >
              {showOrApiKey ? t('auth.hideApiKey') : t('auth.showApiKey')}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>{t('settings.modelLabel')}</label>
          <ModelSelector 
            value={selectedModel} 
            onChange={setSelectedModel}
            showProvider={true}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button 
            className="btn-small" 
            onClick={handleSaveSettings}
            disabled={!canSave}
            style={{
              opacity: canSave ? 1 : 0.5,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {t('settings.save')}
          </button>
          {openrouterApiKey && (
            <button className="btn-small btn-secondary" onClick={handleClearSettings}>
              {t('settings.clear')}
            </button>
          )}
        </div>
        {hasChanges && orApiKey.trim() && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent)' }}>
            💡 {t('settings.unsavedChanges')}
          </div>
        )}
      </div>
    </div>
  )
}
