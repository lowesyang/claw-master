import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'

export function MoltbookSetup() {
  const { t } = useLanguage()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.setup.title')}</h1>
        <p className="page-desc">{t('moltbook.setup.subtitle')}</p>
      </div>

      {/* Sub-page tabs: Registration | Agents */}
      <div className="tabs-inline" style={{ marginBottom: '24px' }}>
        <NavLink
          to="/moltbook/setup/registration"
          className={({ isActive }) => `tab-inline ${isActive ? 'active' : ''}`}
        >
          {t('moltbook.setup.tabRegistration')}
        </NavLink>
        <NavLink
          to="/moltbook/setup/agents"
          className={({ isActive }) => `tab-inline ${isActive ? 'active' : ''}`}
        >
          {t('moltbook.setup.tabAgents')}
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

/** Index redirect: /moltbook/setup -> registration or agents based on saved agents */
export function MoltbookSetupIndex() {
  const { savedAgents } = useAuth()
  const moltbookAgents = savedAgents.filter(a => a.platform === 'moltbook')
  return (
    <Navigate
      to={moltbookAgents.length > 0 ? '/moltbook/setup/agents' : '/moltbook/setup/registration'}
      replace
    />
  )
}
