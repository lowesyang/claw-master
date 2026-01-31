import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { FeatureGrid } from '../../common/FeatureGrid'

export function ClawnchHome() {
  const { t } = useLanguage()

  const features = [
    {
      icon: '🔐',
      title: t('nav.accountSetup'),
      desc: t('clawnch.home.setupDesc'),
      path: '/clawnch/setup',
    },
    {
      icon: '🚀',
      title: t('clawnch.home.launch'),
      desc: t('clawnch.home.launchDesc'),
      path: '/clawnch/launch',
    },
    {
      icon: '🪙',
      title: t('clawnch.home.tokens'),
      desc: t('clawnch.home.tokensDesc'),
      path: '/clawnch/tokens',
    },
  ]

  return (
    <div>
      {/* Hero Header */}
      <div style={{ 
        padding: '40px 0 50px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Background Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(131, 83, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
          fontSize: '2.5rem',
          marginBottom: '20px',
          boxShadow: '0 12px 36px rgba(131, 83, 255, 0.25)',
          position: 'relative',
        }}>
          🦞
        </div>
        
        <h1 style={{ 
          fontSize: '2.4rem', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          position: 'relative',
        }}>
          {t('clawnch.title')}
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.05rem',
          position: 'relative',
        }}>
          {t('clawnch.desc')} · {t('clawnch.home.subtitle')}
        </p>
      </div>

      {/* Feature Navigation */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 600, 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.3rem' }}>⚡</span>
          {t('clawnch.home.featureNav')}
        </div>
        <FeatureGrid items={features} />
      </div>

      {/* About Section */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 600, 
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.3rem' }}>📋</span>
          {t('clawnch.home.about')}
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.7' }}>
          {t('clawnch.home.aboutDesc')}
        </p>

        {/* How It Works */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '1.02rem',
          }}>
            <span>🔄</span> {t('clawnch.home.howItWorks')}
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              t('clawnch.home.step1'),
              t('clawnch.home.step2'),
              t('clawnch.home.step3'),
              t('clawnch.home.step4'),
            ].map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  minWidth: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}>
                  {index + 1}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Split */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '1.02rem',
          }}>
            <span>💰</span> {t('clawnch.home.revenueSplit')}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            <div style={{
              padding: '16px',
              background: 'rgba(7, 181, 106, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(7, 181, 106, 0.2)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>80%</div>
              <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                {t('clawnch.home.yourShare')}
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: 'rgba(197, 57, 249, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(197, 57, 249, 0.2)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>20%</div>
              <div style={{ color: 'var(--color-purple)', fontWeight: 600, fontSize: '0.9rem' }}>
                {t('clawnch.home.platformShare')}
              </div>
            </div>
          </div>
        </div>

        {/* Required Fields */}
        <div>
          <h4 style={{ 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '1.02rem',
          }}>
            <span>📝</span> {t('clawnch.home.requiredFields')}
          </h4>
          <table className="api-table">
            <thead>
              <tr>
                <th>{t('clawnch.home.field')}</th>
                <th>{t('clawnch.home.description')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code style={{ color: 'var(--color-purple)' }}>name</code></td>
                <td>{t('clawnch.home.nameDesc')}</td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--color-purple)' }}>symbol</code></td>
                <td>{t('clawnch.home.symbolDesc')}</td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--color-purple)' }}>wallet</code></td>
                <td>{t('clawnch.home.walletDesc')}</td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--color-purple)' }}>description</code></td>
                <td>{t('clawnch.home.descriptionDesc')}</td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--color-purple)' }}>image</code></td>
                <td>{t('clawnch.home.imageDesc')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* API Reference */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top gradient line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
        }} />
        
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 600, 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.3rem' }}>⚙️</span>
          {t('clawnch.home.apiRef')}
        </div>
        <div className="code-block" style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: "'JetBrains Mono', 'Monaco', monospace",
          fontSize: '0.85rem',
          overflow: 'auto',
        }}>
          <code style={{ color: 'var(--text-primary)' }}>{`# Base URL
https://clawn.ch

# Main Endpoints
POST /api/upload    # Upload token image
POST /api/launch    # Launch new token
GET  /api/tokens    # List launched tokens
GET  /api/health    # Service health`}</code>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '16px' }}>
          {t('clawnch.home.fullApiDocs')}
          <a 
            href="https://clawn.ch/skill.md" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'var(--color-purple)', 
              marginLeft: '8px',
              fontWeight: 500,
            }}
          >
            clawn.ch/skill.md →
          </a>
        </p>
      </div>
    </div>
  )
}
