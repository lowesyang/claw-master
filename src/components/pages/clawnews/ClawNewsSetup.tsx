import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { registerAgent } from '../../../services/clawnews'
import { StatusMessage } from '../../common/StatusMessage'
import { Alert } from '../../common/Alert'
import { AgentSwitcher } from '../../common/AgentSwitcher'
import { Select } from '../../common/Select'
import { copyToClipboard, formatDate } from '../../../utils/helpers'
import { ClawNewsCredentials } from '../../../types'

const CAPABILITIES_OPTIONS = [
  'research', 'code', 'browser', 'analysis', 'writing',
  'translation', 'math', 'image', 'audio', 'video'
]

const MODEL_OPTIONS = [
  { value: '', labelKey: 'setup.noSpecify' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet' },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'o1', label: 'OpenAI o1' },
  { value: 'o3-mini', label: 'OpenAI o3-mini' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
  { value: 'deepseek-r1', label: 'DeepSeek R1' },
  { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
  { value: 'qwen-2.5-72b', label: 'Qwen 2.5 72B' },
  { value: 'other', labelKey: 'setup.other' },
] as const

const PROTOCOL_OPTIONS = ['mcp', 'a2a']

export function ClawNewsSetup() {
  const {
    isLoggedIn, apiKey, agentInfo, authStatus, credentials,
    login, logout, saveCredentials, refreshAgentInfo,
    // Multi-agent
    savedAgents, currentAgentId, addAgent, removeAgent, switchAgent, updateAgentName
  } = useClawNews()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  // 登录表单使用的 API key 输入（未登录状态）
  const [loginApiKeyInput, setLoginApiKeyInput] = useState(apiKey)
  // 添加新 agent 表单使用的 API key 输入（已登录状态）- 始终为空
  const [newAgentApiKeyInput, setNewAgentApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loginStatus, setLoginStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)

  // Register form
  const [handle, setHandle] = useState('')
  const [about, setAbout] = useState('')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [model, setModel] = useState('')
  const [protocols, setProtocols] = useState<string[]>([])
  const [registerStatus, setRegisterStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [newCredentials, setNewCredentials] = useState<ClawNewsCredentials | null>(null)

  // Agent management
  const [agentName, setAgentName] = useState('')
  const [addAgentStatus, setAddAgentStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (apiKey) {
      setLoginApiKeyInput(apiKey)
    }
  }, [apiKey])

  const handleLogin = async () => {
    if (!loginApiKeyInput.trim()) {
      setLoginStatus({ message: t('clawnews.setup.enterApiKey'), type: 'error' })
      return
    }

    setLoading(true)
    setLoginStatus(null)

    try {
      // Add to saved agents list and login
      const savedAgent = await addAgent(loginApiKeyInput.trim(), agentName || undefined)
      await switchAgent(savedAgent.id)
      setLoginStatus({ message: t('clawnews.setup.connectSuccess'), type: 'success' })
      setAgentName('')
      // 直接导航，不延迟
      navigate('/clawnews')
    } catch (error) {
      setLoginStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAgent = async () => {
    if (!newAgentApiKeyInput.trim()) {
      setAddAgentStatus({ message: t('clawnews.setup.enterApiKey'), type: 'error' })
      return
    }

    setLoading(true)
    setAddAgentStatus(null)

    try {
      await addAgent(newAgentApiKeyInput.trim(), agentName || undefined)
      setAddAgentStatus({ message: t('clawnews.setup.agentAdded'), type: 'success' })
      setNewAgentApiKeyInput('')
      setAgentName('')
    } catch (error) {
      setAddAgentStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!handle.trim()) {
      setRegisterStatus({ message: t('clawnews.setup.enterHandle'), type: 'error' })
      return
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]{1,49}$/.test(handle)) {
      setRegisterStatus({ message: t('clawnews.setup.handleFormat'), type: 'error' })
      return
    }

    setLoading(true)
    setRegisterStatus(null)

    try {
      const data = await registerAgent({
        handle: handle.trim(),
        about: about.trim() || undefined,
        capabilities: capabilities.length > 0 ? capabilities : undefined,
        model: model || undefined,
        protocol: protocols.length > 0 ? protocols : undefined,
      })

      const creds: ClawNewsCredentials = {
        agent_id: data.agent_id,
        api_key: data.api_key,
        claim_url: data.claim_url,
        claim_code: data.claim_code,
      }

      setNewCredentials(creds)
      saveCredentials(creds)
      setRegisterStatus({ message: t('clawnews.setup.registerSuccess'), type: 'success' })
    } catch (error) {
      setRegisterStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const useNewApiKey = async () => {
    if (!newCredentials) return
    try {
      await login(newCredentials.api_key)
      navigate('/clawnews')
    } catch (error) {
      setRegisterStatus({ message: (error as Error).message, type: 'error' })
    }
  }

  const toggleCapability = (cap: string) => {
    setCapabilities(prev =>
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    )
  }

  const toggleProtocol = (proto: string) => {
    setProtocols(prev =>
      prev.includes(proto) ? prev.filter(p => p !== proto) : [...prev, proto]
    )
  }

  if (isLoggedIn) {
    const clawnewsAgents = savedAgents.filter(a => a.platform === 'clawnews')

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{t('clawnews.setup.title')}</h1>
          <p className="page-desc">{t('clawnews.setup.manageDesc')}</p>
        </div>

        {/* Agent Switcher */}
        {clawnewsAgents.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <AgentSwitcher
              savedAgents={savedAgents}
              currentAgentId={currentAgentId}
              currentAgentName={agentInfo?.handle}
              platform="clawnews"
              onSwitch={switchAgent}
              onRemove={removeAgent}
              onUpdateName={updateAgentName}
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Left Column - Account Info */}
          <div>
            {/* Current Credentials */}
            <div className="card">
              <div className="card-title">{t('clawnews.setup.currentCredentials')}</div>
              <div className="credential-box">
                <div className="credential-label">API Key</div>
                <div className="credential-value">{apiKey.substring(0, 25)}...</div>
                <button className="copy-btn btn-small btn-secondary" onClick={() => copyToClipboard(apiKey)}>
                  {t('common.copy')}
                </button>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button className="btn-secondary btn-small" onClick={logout}>
                  {t('common.logout')}
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">{t('setup.accountInfo')}</div>
              {agentInfo ? (
                <>
                  {authStatus !== null && !authStatus.claimed && (
                    <Alert icon="⏳" title={t('auth.agentUnclaimed')} type="warning">
                      {t('auth.verifyHint')}
                      <br />
                      {(newCredentials?.claim_url || credentials?.claim_url) ? (
                        <a
                          href={newCredentials?.claim_url || credentials?.claim_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent)', wordBreak: 'break-all' }}
                        >
                          {newCredentials?.claim_url || credentials?.claim_url}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {t('auth.claimUrlLost')}
                        </span>
                      )}
                    </Alert>
                  )}

                  {/* Stats Grid */}
                  <div className="stats-grid" style={{ marginBottom: '16px' }}>
                    <div className="stat-item">
                      <div className="stat-value">{agentInfo.karma || 0}</div>
                      <div className="stat-label">{t('setup.karma')}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{agentInfo.follower_count || 0}</div>
                      <div className="stat-label">{t('setup.followers')}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{agentInfo.following_count || 0}</div>
                      <div className="stat-label">{t('setup.following')}</div>
                    </div>
                  </div>

                  <table className="api-table">
                    <tbody>
                      <tr><td>{t('setup.handle')}</td><td>@{agentInfo.handle}</td></tr>
                      <tr><td>{t('setup.about')}</td><td>{agentInfo.about || '-'}</td></tr>
                      <tr><td>{t('setup.capabilities')}</td><td>{agentInfo.capabilities?.join(', ') || '-'}</td></tr>
                      <tr><td>{t('setup.model')}</td><td>{agentInfo.model || '-'}</td></tr>
                      <tr><td>{t('setup.status')}</td><td>{authStatus?.verified ? t('auth.verified') : authStatus?.claimed ? t('auth.claimed') : t('auth.unclaimed')}</td></tr>
                      <tr><td>{t('setup.createdAt')}</td><td>{formatDate(agentInfo.created_at)}</td></tr>
                    </tbody>
                  </table>
                  <button
                    className="btn-small btn-secondary"
                    style={{ marginTop: '16px' }}
                    onClick={() => refreshAgentInfo()}
                  >
                    {t('setup.refreshInfo')}
                  </button>
                </>
              ) : (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>{t('common.loading')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Agent Management */}
          <div>
            {/* Add New Agent Card */}
            <div className="card">
              <div className="card-title">{t('clawnews.setup.addNewAgent')}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {t('clawnews.setup.addNewAgentDesc')}
              </p>
              {addAgentStatus && <StatusMessage message={addAgentStatus.message} type={addAgentStatus.type} />}
              <div className="form-group">
                <label>{t('clawnews.setup.agentNameOptional')}</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={t('clawnews.setup.agentNamePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={newAgentApiKeyInput}
                    onChange={(e) => setNewAgentApiKeyInput(e.target.value)}
                    placeholder="clawnews_sk_..."
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
              <button className="btn-block" onClick={handleAddAgent} disabled={loading}>
                {loading ? t('clawnews.setup.adding') : t('clawnews.setup.addAgent')}
              </button>
            </div>

            {/* Agent List */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                {t('clawnews.setup.savedAgents')}
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                  {clawnewsAgents.length} {clawnewsAgents.length === 1 ? 'agent' : 'agents'}
                </span>
              </div>
              {clawnewsAgents.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">🤖</div>
                  <p>No agents added yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {clawnewsAgents.map(agent => (
                    <div
                      key={agent.id}
                      style={{
                        padding: '14px',
                        background: agent.id === currentAgentId ? 'rgba(7, 181, 106, 0.08)' : 'var(--bg-secondary)',
                        border: agent.id === currentAgentId ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: agent.id === currentAgentId ? 'var(--gradient-clawnews)' : 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                        }}>🤖</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
                            {agent.id === currentAgentId && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                background: 'var(--accent)',
                                color: 'white',
                                borderRadius: '4px',
                              }}>
                                {t('clawnews.setup.current')}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {agent.handle && `@${agent.handle} • `}{formatDate(agent.addedAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {agent.id !== currentAgentId && (
                          <button className="btn-small" style={{ flex: 1 }} onClick={() => switchAgent(agent.id)}>
                            {t('clawnews.setup.switch')}
                          </button>
                        )}
                        <button
                          className="btn-small"
                          style={{
                            flex: agent.id === currentAgentId ? 1 : 'none',
                            background: 'rgba(247, 93, 95, 0.1)',
                            border: '1px solid var(--error)',
                            color: 'var(--error)'
                          }}
                          onClick={() => {
                            if (confirm(t('clawnews.setup.confirmRemove'))) {
                              removeAgent(agent.id)
                            }
                          }}
                        >
                          {t('clawnews.setup.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('clawnews.setup.title')}</h1>
        <p className="page-desc">{t('clawnews.setup.subtitle')}</p>
      </div>

      <div className="tabs-inline">
        <button
          className={`tab-inline ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          {t('clawnews.setup.hasApiKey')}
        </button>
        <button
          className={`tab-inline ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          {t('clawnews.setup.registerNewAgent')}
        </button>
      </div>

      {activeTab === 'login' && (
        <div className="card">
          <div className="card-title">{t('clawnews.setup.connectExisting')}</div>
          {loginStatus && <StatusMessage message={loginStatus.message} type={loginStatus.type} />}
          <div className="form-group">
            <label>{t('clawnews.setup.agentNameOptional')}</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder={t('clawnews.setup.agentNamePlaceholderFull')}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {t('clawnews.setup.agentNameHint')}
            </small>
          </div>
          <div className="form-group">
            <label>API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={loginApiKeyInput}
                onChange={(e) => setLoginApiKeyInput(e.target.value)}
                placeholder="clawnews_sk_..."
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
          {loginApiKeyInput && (
            <div className="status info" style={{ display: 'block' }}>
              {t('clawnews.setup.apiKeyRestored')}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('clawnews.setup.apiKeyStorageNote')}
          </p>
          <button className="btn-block" onClick={handleLogin} disabled={loading}>
            {loading ? t('clawnews.setup.connecting') : t('clawnews.setup.connect')}
          </button>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="card">
          <div className="card-title">{t('clawnews.setup.registerNewAgent')}</div>
          {registerStatus && <StatusMessage message={registerStatus.message} type={registerStatus.type} />}

          {!newCredentials ? (
            <>
              <div className="form-group">
                <label>{t('clawnews.setup.handleLabel')}*</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="your_unique_name"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {t('clawnews.setup.handleHint')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('setup.about')}</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder={t('clawnews.setup.aboutPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>{t('clawnews.setup.capabilitiesLabel')}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CAPABILITIES_OPTIONS.map(cap => (
                    <button
                      key={cap}
                      type="button"
                      className={`btn-small ${capabilities.includes(cap) ? '' : 'btn-secondary'}`}
                      onClick={() => toggleCapability(cap)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>{t('setup.modelOptional')}</label>
                <Select
                  value={model}
                  onChange={setModel}
                  options={MODEL_OPTIONS.map(m => ({
                    value: m.value,
                    label: 'labelKey' in m ? t(m.labelKey as any) : m.label
                  }))}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {t('setup.modelHint')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('clawnews.setup.protocolsLabel')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PROTOCOL_OPTIONS.map(proto => (
                    <button
                      key={proto}
                      type="button"
                      className={`btn-small ${protocols.includes(proto) ? '' : 'btn-secondary'}`}
                      onClick={() => toggleProtocol(proto)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      {proto.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-block" onClick={handleRegister} disabled={loading}>
                {loading ? t('clawnews.setup.registering') : t('clawnews.setup.registerAgent')}
              </button>
            </>
          ) : (
            <div className="steps">
              <div className="step">
                <div className="step-title">{t('clawnews.setup.saveCredentials')}</div>
                <div className="step-content">
                  <Alert icon="⚠️" title={t('clawnews.setup.saveApiKeyNow')} type="warning">
                    {t('clawnews.setup.apiKeyOnce')}
                  </Alert>

                  <div className="credential-box">
                    <div className="credential-label">Agent ID</div>
                    <div className="credential-value">{newCredentials.agent_id}</div>
                  </div>

                  <div className="credential-box">
                    <div className="credential-label">API Key</div>
                    <div className="credential-value">{newCredentials.api_key}</div>
                    <button
                      className="copy-btn btn-small btn-secondary"
                      onClick={() => copyToClipboard(newCredentials.api_key)}
                    >
                      {t('common.copy')}
                    </button>
                  </div>

                  <div className="credential-box">
                    <div className="credential-label">Claim Code</div>
                    <div className="credential-value">{newCredentials.claim_code}</div>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-title">{t('clawnews.setup.claimAccount')}</div>
                <div className="step-content">
                  <p style={{ marginBottom: '12px' }}>{t('clawnews.setup.claimAccountDesc')}</p>
                  <div className="credential-box">
                    <div className="credential-label">{t('clawnews.setup.verificationLink')}</div>
                    <div className="credential-value">
                      <a
                        href={newCredentials.claim_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)' }}
                      >
                        {newCredentials.claim_url}
                      </a>
                    </div>
                    <button
                      className="copy-btn btn-small btn-secondary"
                      onClick={() => copyToClipboard(newCredentials.claim_url)}
                    >
                      {t('common.copy')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-title">{t('clawnews.setup.startUsing')}</div>
                <div className="step-content">
                  <button className="btn-block" onClick={useNewApiKey}>
                    {t('clawnews.setup.useApiKeyLogin')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
