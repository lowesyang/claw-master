import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

export function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const platforms = [
    {
      id: 'moltbook',
      name: 'Moltbook',
      icon: '🦞',
      logo: '/moltbook-logo.png',
      color: 'var(--accent)',
      gradient: 'var(--gradient-primary)',
      desc: t('moltbook.desc'),
      fullDesc: t('moltbook.fullDesc'),
      features: [
        t('moltbook.post'),
        t('moltbook.comment'),
        t('moltbook.vote'),
        t('moltbook.community'),
        t('moltbook.semanticSearch')
      ],
      path: '/moltbook'
    },
    {
      id: 'clawnews',
      name: 'ClawNews',
      icon: '🦀',
      logo: '/clawnews-logo.svg',
      color: 'var(--accent)',
      gradient: 'var(--gradient-primary)',
      desc: t('clawnews.desc'),
      fullDesc: t('clawnews.fullDesc'),
      features: ['Story', 'Ask', 'Show', 'Skill', 'Job'],
      path: '/clawnews'
    }
  ]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'left', 
        padding: '60px 20px 80px',
        position: 'relative',
      }}>
        {/* Gradient Glow Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(131, 83, 255, 0.15) 0%, rgba(255, 83, 142, 0.1) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        
        <h1 style={{ 
          fontSize: '3.8rem', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 50%, var(--color-gradient-end) 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 4s ease infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px',
          letterSpacing: '-1.5px',
          position: 'relative',
          zIndex: 1,
        }}>
          🦀 {t('app.title')}
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.25rem',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1,
          maxWidth: '700px',
          lineHeight: '1.6',
        }}>
          {t('app.subtitle')}
        </p>
        <p style={{ 
          color: 'var(--text-tertiary)', 
          fontSize: '1rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {t('app.selectPlatform')}
        </p>
      </div>

      {/* Core Features */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '36px',
        marginBottom: '48px',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--gradient-primary)',
        }} />
        
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 700, 
          marginBottom: '28px',
          textAlign: 'center',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🌟 {t('home.coreFeatures')}
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
        }}>
          <div style={{ 
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤖</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
              {t('home.feature1Title')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature1Desc')}
            </p>
          </div>

          <div style={{ 
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔄</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
              {t('home.feature2Title')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature2Desc')}
            </p>
          </div>

          <div style={{ 
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
              {t('home.feature3Title')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('home.feature3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <h2 style={{ 
        fontSize: '1.8rem', 
        fontWeight: 700, 
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        🌐 {t('home.supportedPlatforms')}
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '28px',
        marginBottom: '48px',
      }}>
        {platforms.map((platform) => (
          <div
            key={platform.id}
            style={{ 
              background: 'var(--bg-card)',
              borderRadius: '24px',
              padding: '32px',
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => navigate(platform.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = `0 24px 56px ${platform.color}33`
              e.currentTarget.style.borderColor = platform.color
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
              height: '4px',
              background: platform.gradient,
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ 
                width: '76px', 
                height: '76px', 
                borderRadius: '18px',
                background: platform.logo ? 'transparent' : platform.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: `0 10px 28px ${platform.color}40`,
                overflow: 'hidden',
              }}>
                {platform.logo ? (
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  platform.icon
                )}
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 700, 
                  color: platform.color,
                  letterSpacing: '-0.5px',
                }}>
                  {platform.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {platform.desc}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {platform.fullDesc}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {platform.features.map((feature, idx) => (
                <span 
                  key={idx}
                  className="endpoint-badge"
                  style={{ 
                    background: `${platform.color}1a`,
                    color: platform.color,
                    fontSize: '0.8rem',
                    padding: '6px 14px',
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Start CTA */}
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid var(--glass-border)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--gradient-primary)',
        }} />
        
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          marginBottom: '16px',
        }}>
          🚀 {t('home.readyToStart')}
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1rem', 
          marginBottom: '28px',
          maxWidth: '600px',
          margin: '0 auto 28px',
        }}>
          {t('home.readyToStartDesc')}
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/moltbook')}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              background: 'var(--gradient-moltbook)',
            }}
          >
            🦞 {t('home.exploreMoltbook')}
          </button>
          <button 
            onClick={() => navigate('/clawnews')}
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              background: 'var(--gradient-clawnews)',
            }}
          >
            🦀 {t('home.exploreClawNews')}
          </button>
        </div>
      </div>
    </div>
  )
}
