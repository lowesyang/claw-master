import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { TranslationKey } from '../../i18n/translations'

interface NavItem {
  path: string
  icon: string
  labelKey: TranslationKey
}

interface NavSection {
  titleKey: TranslationKey
  titlePrefix?: string
  titleIcon?: string
  items: NavItem[]
  platform?: 'moltbook' | 'clawnews' | 'clawnch'
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav.home',
    items: [
      { path: '/', icon: '⚡', labelKey: 'nav.platformSelect' },
    ],
  },
  {
    titleKey: 'moltbook.title',
    titlePrefix: '',
    titleIcon: '/moltbook-logo.png',
    platform: 'moltbook',
    items: [
      { path: '/moltbook', icon: '🏠', labelKey: 'nav.home' },
      { path: '/moltbook/setup', icon: '🔐', labelKey: 'nav.accountSetup' },
      { path: '/moltbook/post', icon: '✍️', labelKey: 'nav.post' },
      { path: '/moltbook/feed', icon: '📡', labelKey: 'nav.feed' },
      { path: '/moltbook/search', icon: '🔮', labelKey: 'nav.search' },
      { path: '/moltbook/docs/quickstart', icon: '🚀', labelKey: 'nav.quickStart' },
      { path: '/moltbook/docs/api', icon: '⚙️', labelKey: 'nav.apiRef' },
      { path: '/moltbook/docs/features', icon: '💎', labelKey: 'nav.features' },
    ],
  },
  {
    titleKey: 'clawnews.title',
    titlePrefix: '',
    titleIcon: '/clawnews-logo.svg',
    platform: 'clawnews',
    items: [
      { path: '/clawnews', icon: '🏠', labelKey: 'nav.home' },
      { path: '/clawnews/setup', icon: '🔐', labelKey: 'nav.accountSetup' },
      { path: '/clawnews/post', icon: '✍️', labelKey: 'nav.post' },
      { path: '/clawnews/feed', icon: '📡', labelKey: 'nav.feed' },
      { path: '/clawnews/agents', icon: '🤖', labelKey: 'nav.discoverAgents' },
      { path: '/clawnews/docs/quickstart', icon: '🚀', labelKey: 'nav.quickStart' },
      { path: '/clawnews/docs/api', icon: '⚙️', labelKey: 'nav.apiRef' },
      { path: '/clawnews/docs/features', icon: '💎', labelKey: 'nav.features' },
    ],
  },
  {
    titleKey: 'clawnch.title',
    titlePrefix: '',
    titleIcon: '🦞',
    platform: 'clawnch',
    items: [
      { path: '/clawnch', icon: '🏠', labelKey: 'nav.home' },
      { path: '/clawnch/setup', icon: '🔐', labelKey: 'nav.accountSetup' },
      { path: '/clawnch/launch', icon: '🚀', labelKey: 'clawnch.home.launch' },
      { path: '/clawnch/tokens', icon: '🪙', labelKey: 'clawnch.home.tokens' },
    ],
  },
]

type PlatformType = 'moltbook' | 'clawnews' | 'clawnch'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  // Determine current platform from URL
  const isClawNews = location.pathname.startsWith('/clawnews')
  const isClawnch = location.pathname.startsWith('/clawnch')

  // Platform selector state - auto-detect based on current route
  // Default to moltbook if on home page
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(() => {
    if (isClawNews) return 'clawnews'
    if (isClawnch) return 'clawnch'
    return 'moltbook' // Default to moltbook for home and moltbook routes
  })

  // Update selected platform when route changes
  useEffect(() => {
    if (location.pathname.startsWith('/clawnews')) {
      setSelectedPlatform('clawnews')
    } else if (location.pathname.startsWith('/moltbook')) {
      setSelectedPlatform('moltbook')
    } else if (location.pathname.startsWith('/clawnch')) {
      setSelectedPlatform('clawnch')
    }
    // Don't change selection when on home page
  }, [location.pathname])

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform)

    // Navigate to platform home when switching
    if (platform === 'moltbook') {
      navigate('/moltbook')
    } else if (platform === 'clawnews') {
      navigate('/clawnews')
    } else if (platform === 'clawnch') {
      navigate('/clawnch')
    }
  }

  // Filter sections based on selected platform
  const filteredSections = navSections.filter(section => {
    if (!section.platform) return true // Always show home section
    return section.platform === selectedPlatform
  })

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/claw-master-logo.svg" 
            alt="Claw Master Logo" 
            style={{ 
              width: '36px', 
              height: '36px',
              filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.3))',
            }} 
          />
          <span style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #DC2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Claw Master</span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginTop: '8px',
          letterSpacing: '0.3px'
        }}>
          {t('app.subtitle')}
        </div>

        {/* Theme & Language Controls */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px'
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              fontWeight: 500,
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
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              fontWeight: 500,
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
            <span>🌐</span>
            <span>{language === 'zh' ? '中' : 'EN'}</span>
          </button>
        </div>

        {/* Platform Selector */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
            {t('nav.selectPlatform')}
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <button
              onClick={() => handlePlatformChange('moltbook')}
              style={{
                padding: '10px 12px',
                background: selectedPlatform === 'moltbook' ? 'rgba(240, 136, 0, 0.12)' : 'transparent',
                border: selectedPlatform === 'moltbook' ? '1px solid var(--moltbook-color)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'moltbook' ? 'var(--moltbook-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <img
                src="/moltbook-logo.png"
                alt="Moltbook"
                style={{
                  width: '20px',
                  height: '20px'
                }}
              />
              <span>{t('moltbook.title')}</span>
            </button>
            <button
              onClick={() => handlePlatformChange('clawnews')}
              style={{
                padding: '10px 12px',
                background: selectedPlatform === 'clawnews' ? 'rgba(7, 181, 106, 0.12)' : 'transparent',
                border: selectedPlatform === 'clawnews' ? '1px solid var(--clawnews-color)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'clawnews' ? 'var(--clawnews-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <img
                src="/clawnews-logo.svg"
                alt="ClawNews"
                style={{
                  width: '20px',
                  height: '20px'
                }}
              />
              <span>{t('clawnews.title')}</span>
            </button>
            <button
              onClick={() => handlePlatformChange('clawnch')}
              style={{
                padding: '10px 12px',
                background: selectedPlatform === 'clawnch' ? 'rgba(131, 83, 255, 0.12)' : 'transparent',
                border: selectedPlatform === 'clawnch' ? '1px solid var(--color-purple)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'clawnch' ? 'var(--color-purple)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>🦞</span>
              <span>{t('clawnch.title')}</span>
            </button>
          </div>
        </div>
      </div>

      {filteredSections.map((section) => (
        <div
          key={section.titleKey}
          className={`nav-section ${section.platform ? `platform-${section.platform}` : ''}`}
          style={{
            ...(section.platform === 'moltbook' && {
              borderLeft: '3px solid var(--moltbook-color)',
              background: 'rgba(240, 136, 0, 0.06)',
              borderRadius: '0 12px 12px 0',
              marginRight: '8px',
              transition: 'all 0.2s ease',
            }),
            ...(section.platform === 'clawnews' && {
              borderLeft: '3px solid var(--clawnews-color)',
              background: 'rgba(7, 181, 106, 0.06)',
              borderRadius: '0 12px 12px 0',
              marginRight: '8px',
              transition: 'all 0.2s ease',
            }),
            ...(section.platform === 'clawnch' && {
              borderLeft: '3px solid var(--color-purple)',
              background: 'rgba(131, 83, 255, 0.06)',
              borderRadius: '0 12px 12px 0',
              marginRight: '8px',
              transition: 'all 0.2s ease',
            }),
          }}
        >
          <div
            className="nav-section-title"
            style={{
              ...(section.platform === 'moltbook' && { color: 'var(--moltbook-color)' }),
              ...(section.platform === 'clawnews' && { color: 'var(--clawnews-color)' }),
              ...(section.platform === 'clawnch' && { color: 'var(--color-purple)' }),
            }}
          >
            {section.titleIcon && (
              typeof section.titleIcon === 'string' && section.titleIcon.startsWith('/') ? (
                <img
                  src={section.titleIcon}
                  alt=""
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '6px',
                    verticalAlign: 'middle'
                  }}
                />
              ) : (
                <span style={{ marginRight: '6px', fontSize: '20px', verticalAlign: 'middle' }}>
                  {section.titleIcon}
                </span>
              )
            )}
            {section.titlePrefix || ''}{t(section.titleKey)}
          </div>
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/' || item.path === '/moltbook' || item.path === '/clawnews' || item.path === '/clawnch'}
              style={({ isActive }) => ({
                ...(section.platform === 'moltbook' && isActive && {
                  background: 'rgba(240, 136, 0, 0.12)',
                  color: 'var(--moltbook-color)',
                }),
                ...(section.platform === 'clawnews' && isActive && {
                  background: 'rgba(7, 181, 106, 0.12)',
                  color: 'var(--clawnews-color)',
                }),
                ...(section.platform === 'clawnch' && isActive && {
                  background: 'rgba(131, 83, 255, 0.12)',
                  color: 'var(--color-purple)',
                }),
              })}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
