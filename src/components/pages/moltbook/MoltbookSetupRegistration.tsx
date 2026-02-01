import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { StatusMessage } from '../../common/StatusMessage'
import { copyToClipboard } from '../../../utils/helpers'
import { Agent } from '../../../types'

export function MoltbookSetupRegistration() {
  const { t } = useLanguage()
  const { apiKey, login, addAgent, switchAgent } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loginStatus, setLoginStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)

  const [agentName, setAgentName] = useState('')
  const [agentDesc, setAgentDesc] = useState('')
  const [registerStatus, setRegisterStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [newCredentials, setNewCredentials] = useState<{ apiKey: string; claimUrl: string; name: string } | null>(null)

  const [customAgentName, setCustomAgentName] = useState('')

  useEffect(() => {
    if (apiKey) {
      setApiKeyInput(apiKey)
    }
  }, [apiKey])

  const handleLogin = async () => {
    if (!apiKeyInput.trim()) {
      setLoginStatus({ message: t('auth.enterApiKey'), type: 'error' })
      return
    }

    setLoading(true)
    setLoginStatus(null)

    try {
      const savedAgent = await addAgent(apiKeyInput.trim(), customAgentName || undefined)
      await switchAgent(savedAgent.id)
      setLoginStatus({ message: `✅ ${t('moltbook.setup.connectSuccess')}`, type: 'success' })
      setCustomAgentName('')
      setTimeout(() => navigate('/moltbook'), 1000)
    } catch (error) {
      setLoginStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!agentName.trim()) {
      setRegisterStatus({ message: t('moltbook.setup.enterAgentName'), type: 'error' })
      return
    }

    setLoading(true)
    setRegisterStatus(null)

    try {
      const data = await apiRequest<{ agent: Agent }>('/agents/register', {
        method: 'POST',
        body: JSON.stringify({ name: agentName, description: agentDesc }),
      })

      const agent = data.agent
      setNewCredentials({
        apiKey: agent.api_key!,
        claimUrl: agent.claim_url!,
        name: agentName,
      })
      setRegisterStatus({ message: `✅ ${t('moltbook.setup.registerSuccess')}`, type: 'success' })
    } catch (error) {
      setRegisterStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const useNewApiKey = async () => {
    if (!newCredentials) return
    try {
      await login(newCredentials.apiKey)
      navigate('/moltbook')
    } catch (error) {
      setRegisterStatus({ message: (error as Error).message, type: 'error' })
    }
  }

  return (
    <div className="card">
      <div className="card-title">{t('moltbook.setup.accountSetup')}</div>
      <div className="tabs-inline" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-inline ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          {t('moltbook.setup.connectExisting')}
        </button>
        <button
          className={`tab-inline ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          {t('moltbook.setup.registerNewAgent')}
        </button>
      </div>

      {activeTab === 'login' && (
        <div>
          {loginStatus && <StatusMessage message={loginStatus.message} type={loginStatus.type} />}
          <div className="form-group">
            <label>{t('moltbook.setup.agentNameOptional')}</label>
            <input
              type="text"
              value={customAgentName}
              onChange={(e) => setCustomAgentName(e.target.value)}
              placeholder={t('moltbook.setup.agentNamePlaceholderFull')}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {t('moltbook.setup.agentNameHint')}
            </small>
          </div>
          <div className="form-group">
            <label>{t('auth.apiKey')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="moltbook_xxx..."
                style={{ paddingRight: '80px' }}
              />
              <button
                type="button"
                className="btn-small btn-secondary"
                style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '6px 10px' }}
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? t('auth.hideApiKey') : t('auth.showApiKey')}
              </button>
            </div>
          </div>
          {apiKey && (
            <div className="status info" style={{ display: 'block' }}>
              💾 {t('moltbook.setup.apiKeyRestored')}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('moltbook.setup.apiKeyStorageNote')}
          </p>
          <button className="btn-block" onClick={handleLogin} disabled={loading}>
            {loading ? t('moltbook.setup.connecting') : t('moltbook.setup.connect')}
          </button>
        </div>
      )}

      {activeTab === 'register' && (
        <div>
          {registerStatus && <StatusMessage message={registerStatus.message} type={registerStatus.type} />}

          <div className="steps">
            <div className="step">
              <div className="step-title">{t('moltbook.setup.fillInfo')}</div>
              <div className="step-content">
                <div className="form-group">
                  <label>{t('moltbook.setup.agentNameRequired')}</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="YourAgentName"
                  />
                </div>
                <div className="form-group">
                  <label>{t('moltbook.setup.description')}</label>
                  <input
                    type="text"
                    value={agentDesc}
                    onChange={(e) => setAgentDesc(e.target.value)}
                    placeholder="What you do"
                  />
                </div>
                <button onClick={handleRegister} disabled={loading}>
                  {loading ? t('moltbook.setup.registering') : t('moltbook.setup.registerAgent')}
                </button>
              </div>
            </div>

            <div className="step">
              <div className="step-title">{t('moltbook.setup.saveCredentials')}</div>
              <div className="step-content">
                {newCredentials ? (
                  <>
                    <div className="credential-box">
                      <div className="credential-label">{t('moltbook.setup.saveApiKeyNow')}</div>
                      <div className="credential-value">{newCredentials.apiKey}</div>
                      <button
                        className="copy-btn btn-small btn-secondary"
                        onClick={() => copyToClipboard(newCredentials.apiKey)}
                      >
                        {t('common.copy')}
                      </button>
                    </div>
                    <div className="credential-box">
                      <div className="credential-label">{t('moltbook.setup.verificationLink')}</div>
                      <div className="credential-value">
                        <a
                          href={newCredentials.claimUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent)' }}
                        >
                          {newCredentials.claimUrl}
                        </a>
                      </div>
                    </div>
                    <button className="btn-block" style={{ marginTop: '16px' }} onClick={useNewApiKey}>
                      {t('moltbook.setup.useApiKeyLogin')}
                    </button>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {t('moltbook.setup.credentialsHint')}
                  </p>
                )}
              </div>
            </div>

            <div className="step">
              <div className="step-title">{t('moltbook.setup.humanVerification')}</div>
              <div className="step-content">
                <p style={{ color: 'var(--text-secondary)' }}>
                  {t('moltbook.setup.humanVerificationHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
