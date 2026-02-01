import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { StatusMessage } from '../common/StatusMessage'

const AI_MODELS = [
  { value: 'anthropic/claude-sonnet-4.5', labelKey: 'settings.model.claudeSonnet45' },
  { value: 'google/gemini-3-flash', labelKey: 'settings.model.gemini3Flash' },
  { value: 'google/gemini-3-pro', labelKey: 'settings.model.gemini3Pro' },
  { value: 'openai/gpt-5.2', labelKey: 'settings.model.gpt52' },
  { value: 'google/gemini-2.0-flash-001', labelKey: 'settings.model.geminiFlash' },
  { value: 'anthropic/claude-3.5-sonnet', labelKey: 'settings.model.claudeSonnet' },
  { value: 'openai/gpt-4o', labelKey: 'settings.model.gpt4o' },
  { value: 'deepseek/deepseek-chat', labelKey: 'settings.model.deepseek' },
]

export function Settings() {
  const { t } = useLanguage()
  const { openrouterApiKey, aiModel, setOpenRouterSettings } = useAuth()

  const [orApiKey, setOrApiKey] = useState(openrouterApiKey)
  const [showOrApiKey, setShowOrApiKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState(aiModel)
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {t(model.labelKey as any)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn-small" onClick={handleSaveSettings}>
            {t('settings.save')}
          </button>
          {openrouterApiKey && (
            <button className="btn-small btn-secondary" onClick={handleClearSettings}>
              {t('settings.clear')}
            </button>
          )}
        </div>
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

      {/* Model Info */}
      <div className="card">
        <div className="card-title">📋 {t('settings.modelInfoTitle')}</div>
        <table className="api-table">
          <thead>
            <tr>
              <th>{t('settings.modelName')}</th>
              <th>{t('settings.modelProvider')}</th>
              <th>{t('settings.modelFeatures')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Claude Sonnet 4.5</td>
              <td>Anthropic</td>
              <td>{t('settings.modelDesc.claudeSonnet45')}</td>
            </tr>
            <tr>
              <td>Gemini 3 Flash</td>
              <td>Google</td>
              <td>{t('settings.modelDesc.gemini3Flash')}</td>
            </tr>
            <tr>
              <td>Gemini 3 Pro</td>
              <td>Google</td>
              <td>{t('settings.modelDesc.gemini3Pro')}</td>
            </tr>
            <tr>
              <td>GPT-5.2</td>
              <td>OpenAI</td>
              <td>{t('settings.modelDesc.gpt52')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
