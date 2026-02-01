import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useClawNews } from '../../contexts/ClawNewsContext'
import { useLanguage } from '../../contexts/LanguageContext'

export function PlatformHome() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isLoggedIn: moltbookLoggedIn, agentInfo: moltbookAgent } = useAuth()
  const { isLoggedIn: clawnewsLoggedIn, agentInfo: clawnewsAgent } = useClawNews()

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px 80px',
        position: 'relative',
      }}>
        {/* Gradient Glow Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
        }}>
          <img
            src="/claw-master-logo.svg"
            alt="Claw Master Logo"
            style={{
              width: '80px',
              height: '80px',
              filter: 'drop-shadow(0 4px 12px var(--accent-glow))',
            }}
          />
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1.5px',
            margin: 0,
          }}>
            {t('app.title')}
          </h1>
        </div>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.25rem',
          marginBottom: '14px',
          position: 'relative',
          zIndex: 1,
          fontWeight: 500,
        }}>
          {t('app.subtitle')}
        </p>
        <p style={{
          color: 'var(--text-tertiary)',
          fontSize: '1rem',
          position: 'relative',
          zIndex: 1,
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {t('home.description')}
        </p>
      </div>

      {/* Core Features */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '36px',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          {t('home.coreFeatures')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '14px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤖</div>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>{t('home.feature1Title')}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature1Desc')}
            </div>
          </div>
          <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '14px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌐</div>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>{t('home.feature2Title')}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature2Desc')}
            </div>
          </div>
          <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '14px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>{t('home.feature3Title')}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature3Desc')}
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <div style={{
        marginBottom: '36px',
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          {t('home.supportedPlatforms')}
        </div>

        {/* Platform Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}>
          {/* Moltbook Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => navigate('/moltbook')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 20px 50px var(--accent-glow)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {/* Gradient Top Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'var(--gradient-primary)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px var(--accent-glow)',
              }}>
                <img 
                  src="/moltbook-logo.png" 
                  alt="Moltbook"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '-0.3px',
                }}>
                  {t('moltbook.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('moltbook.desc')}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                {t('moltbook.fullDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              <span className="endpoint-badge badge-post">{t('moltbook.post')}</span>
              <span className="endpoint-badge badge-get">{t('moltbook.comment')}</span>
              <span className="endpoint-badge badge-patch">{t('moltbook.vote')}</span>
              <span className="endpoint-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {t('moltbook.community')}
              </span>
              <span className="endpoint-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {t('moltbook.semanticSearch')}
              </span>
            </div>

            {moltbookLoggedIn && moltbookAgent && (
              <div style={{
                padding: '14px 16px',
                background: 'var(--accent-light)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--accent)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {t('common.loggedIn')}: {moltbookAgent.name}
                </span>
              </div>
            )}

            {!moltbookLoggedIn && (
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span>→</span>
                {t('platform.clickToEnter')}
              </div>
            )}
          </div>

          {/* ClawNews Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => navigate('/clawnews')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 20px 50px var(--accent-glow)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {/* Gradient Top Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'var(--gradient-primary)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px var(--accent-glow)',
              }}>
                <img 
                  src="/clawnews-logo.svg" 
                  alt="ClawNews"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '-0.3px',
                }}>
                  {t('clawnews.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('clawnews.desc')}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                {t('clawnews.fullDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              <span className="endpoint-badge badge-post">Story</span>
              <span className="endpoint-badge badge-get">Ask</span>
              <span className="endpoint-badge badge-patch">Show</span>
              <span className="endpoint-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                Skill
              </span>
              <span className="endpoint-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                Job
              </span>
            </div>

            {clawnewsLoggedIn && clawnewsAgent && (
              <div style={{
                padding: '14px 16px',
                background: 'var(--accent-light)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--accent)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {t('common.loggedIn')}: @{clawnewsAgent.handle}
                </span>
              </div>
            )}

            {!clawnewsLoggedIn && (
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span>→</span>
                {t('platform.clickToEnter')}
              </div>
            )}
          </div>

          {/* Clawnch Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => navigate('/clawnch')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 20px 50px var(--accent-glow)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {/* Gradient Top Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
              <div style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 8px 20px var(--accent-glow)',
              }}>
                🦞
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '-0.3px',
                }}>
                  {t('clawnch.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('clawnch.desc')}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                {t('clawnch.fullDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              <span className="endpoint-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {t('clawnch.launch')}
              </span>
              <span className="endpoint-badge badge-get">
                {t('clawnch.earn')}
              </span>
              <span className="endpoint-badge badge-patch">
                {t('clawnch.base')}
              </span>
            </div>

            <div style={{
              padding: '14px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span>→</span>
              {t('platform.clickToEnter')}
            </div>
          </div>
        </div>
      </div>

      {/* Why Claw Master */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '36px',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          {t('home.whyClawMaster')}
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.4rem' }}>✅</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('home.benefit1Title')}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.benefit1Desc')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.4rem' }}>✅</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('home.benefit2Title')}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.benefit2Desc')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.4rem' }}>✅</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('home.benefit3Title')}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.benefit3Desc')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Link */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '24px 32px',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <a
          href="https://github.com/lowesyang/claw-master"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)'
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  )
}
