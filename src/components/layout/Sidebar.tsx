import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { TranslationKey, Language } from '../../i18n/translations'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
]

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
      { path: '/', icon: 'ℹ️', labelKey: 'nav.platformSelect' },
      { path: '/settings', icon: '⚙️', labelKey: 'nav.settings' },
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
      { path: '/moltbook/submolts', icon: '🏘️', labelKey: 'nav.submolts' },
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
      { path: '/clawnews/skills', icon: '🛠️', labelKey: 'nav.skills' },
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

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const currentLang = LANGUAGES.find((l) => l.code === language)
  const currentLangLabel = currentLang?.label ?? 'EN'
  const currentLangFlag = currentLang?.flag ?? '🌐'

  useEffect(() => {
    if (!languageMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [languageMenuOpen])

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
              filter: 'drop-shadow(0 2px 6px rgba(var(--accent-rgb), 0.3))',
            }} 
          />
          <span style={{
            background: 'var(--gradient-primary)',
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

        {/* Theme & Language & GitHub Controls */}
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
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>
          <div ref={languageMenuRef} style={{ flex: 1, position: 'relative' }}>
            <button
              onClick={() => setLanguageMenuOpen((o) => !o)}
              style={{
                width: '100%',
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
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <span style={{ fontSize: '1rem' }}>{currentLangFlag}</span>
              <span>{currentLangLabel}</span>
            </button>
            {languageMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: 'max-content',
                  minWidth: '120px',
                  marginTop: '4px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}
              >
                {LANGUAGES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code)
                      setLanguageMenuOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: code === language ? 'var(--accent-light)' : 'transparent',
                      border: 'none',
                      color: code === language ? 'var(--accent)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      fontWeight: code === language ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{flag}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* GitHub Link */}
          <a
            href="https://github.com/lowesyang/claw-master"
            target="_blank"
            rel="noopener noreferrer"
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
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-hover)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
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
                background: selectedPlatform === 'moltbook' ? 'var(--accent-light)' : 'transparent',
                border: selectedPlatform === 'moltbook' ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'moltbook' ? 'var(--accent)' : 'var(--text-secondary)',
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
                background: selectedPlatform === 'clawnews' ? 'var(--accent-light)' : 'transparent',
                border: selectedPlatform === 'clawnews' ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'clawnews' ? 'var(--accent)' : 'var(--text-secondary)',
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
                background: selectedPlatform === 'clawnch' ? 'var(--accent-light)' : 'transparent',
                border: selectedPlatform === 'clawnch' ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: '8px',
                color: selectedPlatform === 'clawnch' ? 'var(--accent)' : 'var(--text-secondary)',
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
            ...(section.platform && {
              borderLeft: '3px solid var(--accent)',
              background: 'var(--accent-light)',
              borderRadius: '0 12px 12px 0',
              marginRight: '8px',
              transition: 'all 0.2s ease',
            }),
          }}
        >
          {section.platform && (
            <div
              className="nav-section-title"
              style={{ color: 'var(--accent)' }}
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
          )}
          {section.items.map((item) => {
            // Feed items should also be active for post detail pages
            const postDetailPattern = item.path === '/moltbook/feed' 
              ? /^\/moltbook\/post\/[^/]+$/
              : item.path === '/clawnews/feed'
                ? /^\/clawnews\/post\/[^/]+$/
                : null
            const isPostDetailActive = postDetailPattern && postDetailPattern.test(location.pathname)
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive || isPostDetailActive ? 'active' : ''}`}
                end={item.path === '/' || item.path === '/moltbook' || item.path === '/clawnews' || item.path === '/clawnch' || item.path === '/moltbook/post' || item.path === '/clawnews/post'}
                style={({ isActive }) => ((isActive || isPostDetailActive) ? {
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                } : {})}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
