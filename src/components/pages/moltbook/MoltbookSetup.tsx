import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { StatusMessage } from '../../common/StatusMessage'
import { AgentBanner } from '../../common/AgentBanner'
import { Alert } from '../../common/Alert'
import { AgentSwitcher } from '../../common/AgentSwitcher'
import { formatDate, copyToClipboard } from '../../../utils/helpers'
import { Agent } from '../../../types'

export function MoltbookSetup() {
  const { t } = useLanguage()
  const {
    isLoggedIn, apiKey, agentInfo, login, logout, openrouterApiKey, aiModel, setOpenRouterSettings,
    // Multi-agent
    savedAgents, currentAgentId, addAgent, removeAgent, switchAgent, updateAgentName
  } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loginStatus, setLoginStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)

  // Register form
  const [agentName, setAgentName] = useState('')
  const [agentDesc, setAgentDesc] = useState('')
  const [registerStatus, setRegisterStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [newCredentials, setNewCredentials] = useState<{ apiKey: string; claimUrl: string; name: string } | null>(null)

  // Account details
  const [accountDetails, setAccountDetails] = useState<Agent | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)

  // Agent management
  const [customAgentName, setCustomAgentName] = useState('')
  const [addAgentStatus, setAddAgentStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (apiKey) {
      setApiKeyInput(apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (isLoggedIn) {
      loadAccountDetails()
    }
  }, [isLoggedIn])

  const loadAccountDetails = async () => {
    setAccountLoading(true)
    try {
      const data = await apiRequest<{ agent?: Agent }>('/agents/me', {}, apiKey)
      setAccountDetails(data.agent || data as unknown as Agent)
    } catch (error) {
      const err = error as { message?: string; hint?: string }
      if (err.message?.includes('not yet claimed')) {
        let claimUrl: string | undefined
        if (err.hint) {
          const urlMatch = err.hint.match(/https:\/\/[^\s]+/)
          if (urlMatch) claimUrl = urlMatch[0]
        }
        setAccountDetails({
          name: agentInfo?.name || 'Agent',
          is_claimed: false,
          karma: 0,
          claim_url: claimUrl || agentInfo?.claim_url,
        })
      }
    } finally {
      setAccountLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!apiKeyInput.trim()) {
      setLoginStatus({ message: t('auth.enterApiKey'), type: 'error' })
      return
    }

    setLoading(true)
    setLoginStatus(null)

    try {
      // Add to saved agents list and login
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

  const handleAddAgent = async () => {
    if (!apiKeyInput.trim()) {
      setAddAgentStatus({ message: t('auth.enterApiKey'), type: 'error' })
      return
    }

    setLoading(true)
    setAddAgentStatus(null)

    try {
      await addAgent(apiKeyInput.trim(), customAgentName || undefined)
      setAddAgentStatus({ message: `✅ ${t('moltbook.setup.agentAdded')}`, type: 'success' })
      setApiKeyInput('')
      setCustomAgentName('')
    } catch (error) {
      setAddAgentStatus({ message: (error as Error).message, type: 'error' })
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

  const handleSaveOpenRouter = () => {
    if (!orApiKey.trim()) {
      setOrStatus({ message: t('moltbook.setup.enterOpenRouterKey'), type: 'error' })
      return
    }
    setOpenRouterSettings(orApiKey.trim(), selectedModel)
    setOrStatus({ message: `✅ ${t('moltbook.setup.settingsSaved')}`, type: 'success' })
  }

  if (isLoggedIn) {
    const moltbookAgents = savedAgents.filter(a => a.platform === 'moltbook')

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.setup.title')}</h1>
          <p className="page-desc">{t('moltbook.setup.subtitle')}</p>
        </div>

        {/* Agent Switcher */}
        {moltbookAgents.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <AgentSwitcher
              savedAgents={savedAgents}
              currentAgentId={currentAgentId}
              currentAgentName={agentInfo?.name}
              platform="moltbook"
              onSwitch={switchAgent}
              onRemove={removeAgent}
              onUpdateName={updateAgentName}
            />
          </div>
        )}

        {agentInfo && <AgentBanner agent={agentInfo} />}

        <div className="card">
          <div className="card-title">📋 {t('moltbook.setup.currentCredentials')}</div>
          <div className="credential-box">
            <div className="credential-label">{t('auth.apiKey')}</div>
            <div className="credential-value">{apiKey.substring(0, 20)}...</div>
            <button className="copy-btn btn-small btn-secondary" onClick={() => copyToClipboard(apiKey)}>
              {t('common.copy')}
            </button>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button className="btn-secondary" onClick={logout}>
              {t('common.logout')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 {t('setup.accountInfo')}</div>
          {accountLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : accountDetails ? (
            accountDetails.is_claimed ? (
              <table className="api-table">
                <tbody>
                  <tr><td>{t('moltbook.setup.name')}</td><td>{accountDetails.name || '-'}</td></tr>
                  <tr><td>{t('moltbook.setup.description')}</td><td>{accountDetails.description || '-'}</td></tr>
                  <tr><td>{t('setup.karma')}</td><td>{accountDetails.karma || 0}</td></tr>
                  <tr><td>{t('setup.followers')}</td><td>{accountDetails.follower_count || 0}</td></tr>
                  <tr><td>{t('setup.following')}</td><td>{accountDetails.following_count || 0}</td></tr>
                  <tr><td>{t('setup.status')}</td><td>{t('auth.verified')}</td></tr>
                  <tr><td>{t('setup.createdAt')}</td><td>{formatDate(accountDetails.created_at)}</td></tr>
                </tbody>
              </table>
            ) : (
              <>
                <Alert icon="⏳" title={t('auth.agentUnclaimed')} type="warning">
                  {accountDetails.claim_url ? (
                    <>
                      {t('auth.verifyHint')}
                      <br />
                      <a
                        href={accountDetails.claim_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', wordBreak: 'break-all' }}
                      >
                        {accountDetails.claim_url}
                      </a>
                    </>
                  ) : (
                    t('moltbook.setup.goToClaimUrl')
                  )}
                </Alert>
                <table className="api-table" style={{ marginTop: '16px' }}>
                  <tbody>
                    <tr><td>{t('moltbook.setup.name')}</td><td>{accountDetails.name || '-'}</td></tr>
                    <tr><td>{t('setup.status')}</td><td>{t('auth.unclaimed')}</td></tr>
                  </tbody>
                </table>
              </>
            )
          ) : (
            <p style={{ color: 'var(--error)' }}>{t('moltbook.setup.loadFailed')}</p>
          )}
        </div>

        {/* Add New Agent Card */}
        <div className="card">
          <div className="card-title">➕ {t('moltbook.setup.addNewAgent')}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('moltbook.setup.addNewAgentDesc')}
          </p>
          {addAgentStatus && <StatusMessage message={addAgentStatus.message} type={addAgentStatus.type} />}
          <div className="form-group">
            <label>{t('moltbook.setup.agentNameOptional')}</label>
            <input
              type="text"
              value={customAgentName}
              onChange={(e) => setCustomAgentName(e.target.value)}
              placeholder={t('moltbook.setup.agentNamePlaceholder')}
            />
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
          <button className="btn-block btn-secondary" onClick={handleAddAgent} disabled={loading}>
            {loading ? t('moltbook.setup.adding') : t('moltbook.setup.addAgent')}
          </button>
        </div>

        {/* Agent List */}
        {moltbookAgents.length > 0 && (
          <div className="card">
            <div className="card-title">📋 {t('moltbook.setup.savedAgents')} ({moltbookAgents.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {moltbookAgents.map(agent => (
                <div
                  key={agent.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: agent.id === currentAgentId ? 'rgba(255, 107, 53, 0.1)' : 'var(--bg-main)',
                    border: agent.id === currentAgentId ? '1px solid var(--moltbook-color)' : '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {agent.name}
                      {agent.id === currentAgentId && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          background: 'var(--moltbook-color)',
                          color: 'white',
                          borderRadius: '4px',
                        }}>
                          {t('moltbook.setup.current')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {t('moltbook.setup.addedAt')} {formatDate(agent.addedAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {agent.id !== currentAgentId && (
                      <button
                        className="btn-small"
                        onClick={() => switchAgent(agent.id)}
                      >
                        {t('moltbook.setup.switch')}
                      </button>
                    )}
                    <button
                      className="btn-small btn-secondary"
                      style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                      onClick={() => {
                        if (confirm(t('moltbook.setup.confirmRemove'))) {
                          removeAgent(agent.id)
                        }
                      }}
                    >
                      {t('moltbook.setup.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.setup.title')}</h1>
        <p className="page-desc">{t('moltbook.setup.subtitle')}</p>
      </div>

      <div className="tabs-inline">
        <button
          className={`tab-inline ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          {t('moltbook.setup.hasApiKey')}
        </button>
        <button
          className={`tab-inline ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          {t('moltbook.setup.registerNew')}
        </button>
      </div>

      {activeTab === 'login' && (
        <div className="card">
          <div className="card-title">🔐 {t('moltbook.setup.connectExisting')}</div>
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
        <div className="card">
          <div className="card-title">✨ {t('moltbook.setup.registerNewAgent')}</div>
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
