import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest } from '../../../services/api'
import { AgentBanner } from '../../common/AgentBanner'
import { Alert } from '../../common/Alert'
import { AgentSwitcher } from '../../common/AgentSwitcher'
import { SkillConfig } from '../../common/SkillConfig'
import { formatDate, copyToClipboard } from '../../../utils/helpers'
import { Agent } from '../../../types'

export function MoltbookSetupAgents() {
  const { t } = useLanguage()
  const {
    isLoggedIn, apiKey, agentInfo,
    savedAgents, currentAgentId, logout, switchAgent, removeAgent, updateAgentName,
    refreshAgentInfo
  } = useAuth()

  const [accountDetails, setAccountDetails] = useState<Agent | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn && apiKey) {
      loadAccountDetails()
    } else {
      // 重置状态
      setAccountDetails(null)
      setAccountError(null)
    }
  }, [isLoggedIn, apiKey])

  const loadAccountDetails = async () => {
    if (!apiKey) return
    setAccountLoading(true)
    setAccountError(null)
    try {
      const data = await apiRequest<{ agent?: Agent }>('/agents/me', {}, apiKey)
      const agent = data.agent || data as unknown as Agent
      setAccountDetails(agent)
      // Also refresh the global agent info to update avatar in saved agents
      refreshAgentInfo()
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
      } else {
        // 记录错误但不阻止显示
        setAccountError(err.message || t('moltbook.setup.loadFailed'))
        console.error('Failed to load account details:', err)
      }
    } finally {
      setAccountLoading(false)
    }
  }

  const moltbookAgents = savedAgents.filter(a => a.platform === 'moltbook')
  const hasAgents = moltbookAgents.length > 0

  if (!hasAgents) {
    return (
      <div className="card">
        <div className="card-title">{t('moltbook.setup.tabAgents')}</div>
        <div className="empty-state">
          <div className="empty-state-icon">🔐</div>
          <p>{t('moltbook.setup.noAgentsHint')}</p>
          <NavLink to="/moltbook/setup/registration" className="btn-block" style={{ marginTop: '16px', maxWidth: '280px' }}>
            {t('moltbook.setup.tabRegistration')}
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Agent Switcher + Add Agent */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <AgentSwitcher
          savedAgents={savedAgents}
          currentAgentId={currentAgentId}
          currentAgentName={agentInfo?.name}
          platform="moltbook"
          onSwitch={switchAgent}
          onRemove={removeAgent}
          onUpdateName={updateAgentName}
        />
        <NavLink
          to="/moltbook/setup/registration"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t('moltbook.setup.addNewAgent')}
        </NavLink>
      </div>

      {agentInfo && <AgentBanner agent={agentInfo} platform="moltbook" showStartButton />}

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        alignItems: 'start',
      }} className="setup-grid">
        {/* Left Column - Information Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ margin: 0 }}>
            <div className="card-title">{t('moltbook.setup.currentCredentials')}</div>
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

          <div className="card" style={{ margin: 0 }}>
            <div className="card-title">📊 {t('setup.accountInfo')}</div>
            {accountLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : accountDetails ? (
              accountDetails.is_claimed ? (
                <>
                  {/* Owner Avatar Display */}
                  {accountDetails.owner?.x_avatar && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '16px',
                      padding: '16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                    }}>
                      <img
                        src={accountDetails.owner.x_avatar}
                        alt={accountDetails.owner.x_name || accountDetails.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {accountDetails.name}
                        </div>
                        {accountDetails.owner.x_handle && (
                          <a
                            href={`https://x.com/${accountDetails.owner.x_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--accent)',
                              fontSize: '0.9rem',
                              textDecoration: 'none',
                            }}
                          >
                            {t('agent.owner')}: @{accountDetails.owner.x_handle}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
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
                </>
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
            ) : accountError ? (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <p style={{ color: 'var(--error)', marginBottom: '12px' }}>{accountError}</p>
                <button className="btn-small btn-secondary" onClick={loadAccountDetails}>
                  {t('common.retry')}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{t('moltbook.setup.loadFailed')}</p>
                <button className="btn-small btn-secondary" onClick={loadAccountDetails}>
                  {t('common.retry')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Automation Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkillConfig
            platform="moltbook"
            agentName={agentInfo?.name}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  )
}
