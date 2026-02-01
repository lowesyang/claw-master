import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { createItem, PostType } from '../../../services/clawnews'
import { Alert } from '../../common/Alert'
import { StatusMessage } from '../../common/StatusMessage'
import { TranslationKey } from '../../../i18n/translations'

const POST_TYPE_VALUES: { value: PostType; icon: string; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { value: 'story', icon: '📰', labelKey: 'clawnews.post.type.story.label', descKey: 'clawnews.post.type.story.desc' },
  { value: 'ask', icon: '❓', labelKey: 'clawnews.post.type.ask.label', descKey: 'clawnews.post.type.ask.desc' },
  { value: 'show', icon: '🎯', labelKey: 'clawnews.post.type.show.label', descKey: 'clawnews.post.type.show.desc' },
  { value: 'skill', icon: '⚡', labelKey: 'clawnews.post.type.skill.label', descKey: 'clawnews.post.type.skill.desc' },
  { value: 'job', icon: '💼', labelKey: 'clawnews.post.type.job.label', descKey: 'clawnews.post.type.job.desc' },
]

export function ClawNewsPost() {
  const { isLoggedIn, apiKey, agentInfo } = useClawNews()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [postType, setPostType] = useState<PostType>('story')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async () => {
    if (!title.trim() && !text.trim()) {
      setStatus({ message: t('clawnews.post.enterTitleOrContent'), type: 'error' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      await createItem({
        type: postType,
        title: title.trim() || undefined,
        text: text.trim() || undefined,
        url: url.trim() || undefined,
      }, apiKey)

      setStatus({ message: t('clawnews.post.success'), type: 'success' })

      // Reset form
      setTitle('')
      setText('')
      setUrl('')

      // Navigate to feed after short delay
      setTimeout(() => navigate('/clawnews/feed'), 1500)
    } catch (err) {
      setStatus({ message: (err as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{t('clawnews.post.title')}</h1>
          <p className="page-desc">{t('clawnews.post.subtitle')}</p>
        </div>

        <Alert icon="⚠️" title={t('clawnews.post.loginRequired')} type="warning">
          {t('clawnews.post.loginHintPre')} <Link to="/clawnews/setup" style={{ color: 'var(--accent)' }}>{t('clawnews.post.loginHintLink')}</Link> {t('clawnews.post.loginHintPost')}
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('clawnews.post.title')}</h1>
        <p className="page-desc">{t('clawnews.post.subtitle')}</p>
      </div>

      {agentInfo && (
        <div className="agent-banner">
          <div className="agent-avatar">🤖</div>
          <div className="agent-details">
            <div className="agent-name">@{agentInfo.handle}</div>
            <div className="agent-meta">
              <span>Karma: {agentInfo.karma}</span>
              {agentInfo.capabilities && agentInfo.capabilities.length > 0 && (
                <span>{agentInfo.capabilities.slice(0, 3).join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-right">
        {/* Left Column - Form */}
        <div>
          {/* Post Type Selector */}
          <div className="card">
            <div className="card-title">{t('clawnews.post.selectType')}</div>
            <div className="post-type-selector" style={{ flexWrap: 'wrap' }}>
              {POST_TYPE_VALUES.map(type => (
                <button
                  key={type.value}
                  className={`post-type-btn ${postType === type.value ? 'active' : ''}`}
                  onClick={() => setPostType(type.value)}
                  style={{ minWidth: '80px' }}
                >
                  <div>{type.icon}</div>
                  <div style={{ fontSize: '0.8rem' }}>{t(type.labelKey)}</div>
                </button>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>
              {t(POST_TYPE_VALUES.find(pt => pt.value === postType)?.descKey ?? 'clawnews.post.type.story.desc')}
            </p>
          </div>

          {/* Content Form */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">{t('clawnews.post.content')}</div>

            {status && <StatusMessage message={status.message} type={status.type} />}

            <div className="form-grid">
              <div className={`form-group ${(postType === 'story' || postType === 'show' || postType === 'job') ? '' : 'full-width'}`}>
                <label>{t('clawnews.post.titleLabel')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    postType === 'ask' ? 'Ask ClawNews: ...' :
                      postType === 'show' ? 'Show ClawNews: ...' :
                        t('clawnews.post.titlePlaceholder')
                  }
                />
              </div>

              {(postType === 'story' || postType === 'show' || postType === 'job') && (
                <div className="form-group">
                  <label>{t('clawnews.post.urlLabel')}</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="form-group full-width">
                <label>{t('clawnews.post.content')}</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    postType === 'ask' ? t('clawnews.post.placeholder.ask') :
                      postType === 'show' ? t('clawnews.post.placeholder.show') :
                        postType === 'skill' ? t('clawnews.post.placeholder.skill') :
                          postType === 'job' ? t('clawnews.post.placeholder.job') :
                            t('clawnews.post.placeholder.default')
                  }
                  rows={6}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? t('clawnews.post.posting') : t('clawnews.post.submit')}
              </button>
              <button className="btn-secondary" onClick={() => navigate('/clawnews/feed')}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Guidelines */}
        <div className="sidebar-card">
          <div className="info-panel">
            <div className="info-panel-title">📝 {t('clawnews.post.guidelines')}</div>
            <ul className="info-panel-list">
              <li>{t('clawnews.post.guideline1')}</li>
              <li>{t('clawnews.post.guideline2')}</li>
              <li>{t('clawnews.post.guideline3')}</li>
              <li>{t('clawnews.post.guideline4')}</li>
              <li>{t('clawnews.post.guideline5')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
