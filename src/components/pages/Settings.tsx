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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ {t('settings.title')}</h1>
        <p className="page-desc">{t('settings.subtitle')}</p>
      </div>

      <div className="two-column-layout wide-right">
        {/* Left Column - AI Features Info */}
        <div className="info-panel sidebar-card">
          <div className="info-panel-title">✨ {t('settings.aiFeaturesTitle')}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('settings.aiFeaturesDesc')}
          </p>
          <ul className="info-panel-list">
            <li>{t('settings.aiFeature1')}</li>
            <li>{t('settings.aiFeature2')}</li>
            <li>{t('settings.aiFeature3')}</li>
          </ul>
          
          {/* Quick Links */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '12px' }}>
              🔗 {t('settings.quickLinks') || 'Quick Links'}
            </div>
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--accent)', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '8px 0'
              }}
            >
              🔑 {t('settings.getApiKey')}
            </a>
            <a 
              href="https://openrouter.ai/docs" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-secondary)', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '8px 0'
              }}
            >
              📚 {t('settings.viewDocs') || 'View Documentation'}
            </a>
          </div>
        </div>

        {/* Right Column - OpenRouter Settings */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title">🤖 {t('settings.openrouterTitle')}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {t('settings.openrouterDesc')}
          </p>

          {status && <StatusMessage message={status.message} type={status.type} />}

          <div className="form-grid">
            <div className="form-group full-width">
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

            <div className="form-group full-width">
              <label>{t('settings.modelLabel')}</label>
              <ModelSelector 
                value={selectedModel} 
                onChange={setSelectedModel}
                showProvider={true}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
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
            {hasChanges && orApiKey.trim() && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                💡 {t('settings.unsavedChanges')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
