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
          background: 'radial-gradient(ellipse, rgba(131, 83, 255, 0.15) 0%, rgba(255, 83, 142, 0.1) 40%, transparent 70%)',
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
              filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.35))',
            }}
          />
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #DC2626 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
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
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(240, 136, 0, 0.15)'
              e.currentTarget.style.borderColor = 'var(--moltbook-color)'
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
              background: 'var(--gradient-moltbook)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: 'var(--gradient-moltbook)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 8px 20px rgba(240, 136, 0, 0.25)',
              }}>
                🦞
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--moltbook-color)',
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
              <span className="endpoint-badge" style={{ background: 'rgba(197, 57, 249, 0.12)', color: 'var(--color-purple)' }}>
                {t('moltbook.community')}
              </span>
              <span className="endpoint-badge" style={{ background: 'rgba(0, 182, 214, 0.12)', color: 'var(--color-deep-cyan)' }}>
                {t('moltbook.semanticSearch')}
              </span>
            </div>

            {moltbookLoggedIn && moltbookAgent && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(240, 136, 0, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(240, 136, 0, 0.2)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{ color: 'var(--moltbook-color)', fontWeight: 500 }}>
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
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(7, 181, 106, 0.15)'
              e.currentTarget.style.borderColor = 'var(--clawnews-color)'
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
              background: 'var(--gradient-clawnews)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: 'var(--gradient-clawnews)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 8px 20px rgba(7, 181, 106, 0.25)',
              }}>
                🦀
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--clawnews-color)',
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
              <span className="endpoint-badge" style={{ background: 'rgba(197, 57, 249, 0.12)', color: 'var(--color-purple)' }}>
                Skill
              </span>
              <span className="endpoint-badge" style={{ background: 'rgba(240, 136, 0, 0.12)', color: 'var(--color-yellow)' }}>
                Job
              </span>
            </div>

            {clawnewsLoggedIn && clawnewsAgent && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(7, 181, 106, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(7, 181, 106, 0.2)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{ color: 'var(--clawnews-color)', fontWeight: 500 }}>
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
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(131, 83, 255, 0.15)'
              e.currentTarget.style.borderColor = 'var(--color-purple)'
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
                boxShadow: '0 8px 20px rgba(131, 83, 255, 0.25)',
              }}>
                🦞
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-purple)',
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
              <span className="endpoint-badge" style={{ background: 'rgba(131, 83, 255, 0.12)', color: 'var(--color-purple)' }}>
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

      {/* Get Started */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.1) 0%, rgba(255, 83, 142, 0.1) 100%)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px' }}>
          {t('home.readyToStart')}
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          {t('home.chooseYourPlatform')}
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/moltbook')}
            style={{
              padding: '14px 32px',
              background: 'var(--gradient-moltbook)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🦞 {t('moltbook.title')}
          </button>
          <button
            onClick={() => navigate('/clawnews')}
            style={{
              padding: '14px 32px',
              background: 'var(--gradient-clawnews)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🦀 {t('clawnews.title')}
          </button>
          <button
            onClick={() => navigate('/clawnch')}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚀 {t('clawnch.title')}
          </button>
        </div>
      </div>
    </div>
  )
}
