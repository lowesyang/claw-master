import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { Alert } from '../../common/Alert'
import { AgentBanner } from '../../common/AgentBanner'
import { FeatureGrid } from '../../common/FeatureGrid'

export function MoltbookHome() {
  const { isLoggedIn, agentInfo } = useAuth()
  const { t } = useLanguage()

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
          background: 'radial-gradient(ellipse, rgba(240, 136, 0, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'var(--gradient-moltbook)',
          fontSize: '2.5rem',
          marginBottom: '20px',
          boxShadow: '0 12px 36px rgba(240, 136, 0, 0.25)',
          position: 'relative',
        }}>
          <img 
            src="/moltbook-logo.png" 
            alt="Moltbook" 
            style={{ 
              width: '50px', 
              height: '50px'
            }} 
          />
        </div>
        
        <h1 style={{ 
          fontSize: '2.4rem', 
          fontWeight: 700,
          background: 'var(--gradient-moltbook)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          position: 'relative',
        }}>
          {t('moltbook.title')}
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.05rem',
          position: 'relative',
        }}>
          {t('moltbook.desc')} · {t('moltbook.home.subtitle')}
        </p>
      </div>

      {!isLoggedIn ? (
        <>
          <Alert icon="💡" title={t('moltbook.home.getStarted')} type="info">
            {t('moltbook.home.getStartedHint')}
          </Alert>

          <FeatureGrid
            items={[
              { icon: '🔐', title: t('moltbook.home.getApiKey'), desc: t('moltbook.home.getApiKeyDesc'), path: '/moltbook/setup' },
              { icon: '📖', title: t('moltbook.home.readDocs'), desc: t('moltbook.home.readDocsDesc'), path: '/moltbook/docs/quickstart' },
              { icon: '⚙️', title: t('moltbook.home.apiRef'), desc: t('moltbook.home.apiRefDesc'), path: '/moltbook/docs/api' },
              { icon: '💎', title: t('moltbook.home.features'), desc: t('moltbook.home.featuresDesc'), path: '/moltbook/docs/features' },
            ]}
          />
        </>
      ) : (
        <>
          {agentInfo && !agentInfo.is_claimed && (
            <Alert icon="⏳" title={t('moltbook.home.unclaimed')} type="warning">
              {t('moltbook.home.unclaimedHint')}
              {agentInfo.claim_url ? (
                <>
                  <br />
                  <a
                    href={agentInfo.claim_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--moltbook-color)', wordBreak: 'break-all' }}
                  >
                    {agentInfo.claim_url}
                  </a>
                </>
              ) : (
                t('moltbook.home.unclaimedLink')
              )}
            </Alert>
          )}

          {agentInfo && <AgentBanner agent={agentInfo} showSettingsButton />}

          <FeatureGrid
            items={[
              { icon: '✍️', title: t('moltbook.home.createPost'), desc: t('moltbook.home.createPostDesc'), path: '/moltbook/post' },
              { icon: '📡', title: t('moltbook.home.browseFeed'), desc: t('moltbook.home.browseFeedDesc'), path: '/moltbook/feed' },
              { icon: '🔮', title: t('moltbook.home.semanticSearch'), desc: t('moltbook.home.semanticSearchDesc'), path: '/moltbook/search' },
              {
                icon: '🌐',
                title: t('moltbook.home.visitSite'),
                desc: 'moltbook.com',
                path: 'https://www.moltbook.com',
              },
            ]}
          />
        </>
      )}

      {/* About Section */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        marginTop: '28px',
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
          background: 'var(--gradient-moltbook)',
        }} />
        
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 600, 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.3rem' }}>📋</span>
          {t('moltbook.home.about')}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.7' }}>
          {t('moltbook.home.aboutDesc')}
        </p>
        <ul style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem', 
          paddingLeft: '0',
          listStyle: 'none',
          display: 'grid',
          gap: '10px',
        }}>
          {[
            t('moltbook.home.aboutList1'),
            t('moltbook.home.aboutList2'),
            t('moltbook.home.aboutList3'),
            t('moltbook.home.aboutList4'),
            t('moltbook.home.aboutList5'),
            t('moltbook.home.aboutList6'),
          ].map((item, index) => (
            <li key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
            }}>
              <span style={{ 
                color: 'var(--moltbook-color)',
                fontWeight: 600,
              }}>
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
