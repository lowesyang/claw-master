import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useAgentSkill } from '../../../contexts/AgentSkillContext'
import { apiRequest, generateAIContent, generateAITitle, fetchSkillContent } from '../../../services/api'
import { Alert } from '../../common/Alert'
import { StatusMessage } from '../../common/StatusMessage'
import { ModelSelector } from '../../common/ModelSelector'

type PostType = 'text' | 'link'

export function MoltbookPost() {
  const { isLoggedIn, apiKey, openrouterApiKey, aiModel, setOpenRouterSettings } = useAuth()
  const { t } = useLanguage()
  const { isRunning: isAgentRunning } = useAgentSkill('moltbook')

  const [postType, setPostType] = useState<PostType>('text')
  const [submolt, setSubmolt] = useState('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(aiModel)
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [aiStatus, setAiStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [skillContent, setSkillContent] = useState<string | undefined>(undefined)

  const MAX_CONTENT_LENGTH = 10000
  const MAX_TITLE_LENGTH = 300

  // Fetch skill content when agent auto-run is enabled
  useEffect(() => {
    if (isAgentRunning) {
      fetchSkillContent('moltbook')
        .then(content => setSkillContent(content))
        .catch(err => {
          console.error('Failed to load skill content:', err)
          setSkillContent(undefined)
        })
    } else {
      setSkillContent(undefined)
    }
  }, [isAgentRunning])

  // Sync model selection with global settings
  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    if (openrouterApiKey) {
      setOpenRouterSettings(openrouterApiKey, model)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setStatus({ message: t('moltbook.post.enterTitle'), type: 'error' })
      return
    }

    if (postType === 'link' && !url.trim()) {
      setStatus({ message: t('moltbook.post.enterUrl'), type: 'error' })
      return
    }

    if (postType === 'text' && !content.trim()) {
      setStatus({ message: t('moltbook.post.enterContent'), type: 'error' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const postData: Record<string, string> = {
        submolt: submolt || 'general',
        title: title.trim(),
      }

      if (postType === 'link') {
        postData.url = url.trim()
      } else {
        postData.content = content.trim()
      }

      await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      }, apiKey)

      setStatus({ message: `✅ ${t('moltbook.post.success')}`, type: 'success' })
      setTitle('')
      setContent('')
      setUrl('')
    } catch (error) {
      setStatus({ message: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!openrouterApiKey) {
      setAiStatus({ message: t('moltbook.post.aiConfigHint'), type: 'error' })
      return
    }

    setAiLoading(true)
    setAiStatus(null)

    try {
      // Allow empty: use prompt, title, or fallback to community-based free creation
      const topic = aiPrompt.trim() || title.trim() || `${submolt || 'general'}`
      // Pass skill content when agent auto-run is enabled
      const generatedContent = await generateAIContent(
        openrouterApiKey,
        selectedModel,
        topic,
        submolt || 'general',
        isAgentRunning ? skillContent : undefined
      )
      setContent(generatedContent)

      // Generate title if empty (works for both prompt-based and fallback generation)
      if (!title.trim()) {
        const generatedTitle = await generateAITitle(openrouterApiKey, selectedModel, generatedContent)
        if (generatedTitle) {
          setTitle(generatedTitle)
        }
      }

      setAiStatus({ message: `✅ ${t('moltbook.post.aiContentGenerated')}`, type: 'success' })
      setAiPrompt('')
    } catch (error) {
      setAiStatus({ message: `${t('moltbook.post.aiGenerateFailed')}: ${(error as Error).message}`, type: 'error' })
    } finally {
      setAiLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="moltbook-post-page">
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.post.title')}</h1>
          <p className="page-desc">{t('moltbook.post.subtitle')}</p>
        </div>

        <Alert icon="⚠️" title={t('moltbook.post.loginRequired')} type="warning">
          {t('moltbook.post.loginHintPre')} <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.post.loginHintLink')}</Link> {t('moltbook.post.loginHintPost')}
        </Alert>
      </div>
    )
  }

  return (
    <div className="moltbook-post-page">
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.post.title')}</h1>
        <p className="page-desc">{t('moltbook.post.subtitle')}</p>
      </div>

      {/* Two Column Layout */}
      <div className="post-layout">
        {/* Left Column - Form */}
        <div className="post-form-column">
          <div className="post-form-card">
            {status && (
              <div className="post-status-wrapper">
                <StatusMessage message={status.message} type={status.type} />
              </div>
            )}

            {/* Post Type Selector - Enhanced */}
            <div className="post-type-tabs">
              <button
                type="button"
                className={`post-type-tab ${postType === 'text' ? 'active' : ''}`}
                onClick={() => setPostType('text')}
              >
                <span className="post-type-icon">📝</span>
                <span className="post-type-label">{t('moltbook.post.textPost')}</span>
              </button>
              <button
                type="button"
                className={`post-type-tab ${postType === 'link' ? 'active' : ''}`}
                onClick={() => setPostType('link')}
              >
                <span className="post-type-icon">🔗</span>
                <span className="post-type-label">{t('moltbook.post.linkPost')}</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="post-form-fields">
              {/* Submolt Field */}
              <div className="post-field">
                <label className="post-field-label">
                  <span className="label-icon">📂</span>
                  {t('moltbook.post.submoltLabel')}
                </label>
                <div className="post-input-wrapper">
                  <span className="input-prefix">m/</span>
                  <input
                    type="text"
                    value={submolt}
                    onChange={(e) => setSubmolt(e.target.value)}
                    placeholder="general"
                    className="post-input with-prefix"
                  />
                </div>
              </div>

              {/* Title Field */}
              <div className="post-field">
                <label className="post-field-label">
                  <span className="label-icon">✏️</span>
                  {t('moltbook.post.titleLabel')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                  placeholder="Hello Moltbook!"
                  className="post-input post-title-input"
                />
                <div className="post-field-footer">
                  <span className={`char-counter ${title.length > MAX_TITLE_LENGTH * 0.9 ? 'warning' : ''}`}>
                    {title.length}/{MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>

              {/* Content Field - Text Post */}
              {postType === 'text' && (
                <div className="post-field">
                  <label className="post-field-label">
                    <span className="label-icon">📄</span>
                    {t('moltbook.post.contentLabel')}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
                    placeholder={t('moltbook.post.contentPlaceholder')}
                    className="post-textarea"
                    rows={8}
                  />
                  <div className="post-field-footer">
                    <span className="helper-text">Markdown supported</span>
                    <span className={`char-counter ${content.length > MAX_CONTENT_LENGTH * 0.9 ? 'warning' : ''}`}>
                      {content.length.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* URL Field - Link Post */}
              {postType === 'link' && (
                <div className="post-field">
                  <label className="post-field-label">
                    <span className="label-icon">🌐</span>
                    {t('moltbook.post.urlLabel')}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="post-input"
                  />
                  {url && (
                    <div className="url-preview">
                      <span className="url-preview-label">Preview:</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="url-preview-link">
                        {url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="post-submit-section">
              <button
                className="post-submit-btn"
                onClick={handleSubmit}
                disabled={loading || (!title.trim()) || (postType === 'text' && !content.trim()) || (postType === 'link' && !url.trim())}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    {t('moltbook.post.posting')}
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🦞</span>
                    {t('moltbook.post.submit')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - AI & Info */}
        <div className="post-sidebar-column">
          {/* Post Type Info Card */}
          <div className="post-info-card">
            <div className="post-info-header">
              <span className="post-info-icon">{postType === 'text' ? '📝' : '🔗'}</span>
              <h3 className="post-info-title">
                {postType === 'text' ? t('moltbook.post.textPostTitle') : t('moltbook.post.linkPostTitle')}
              </h3>
            </div>
            <p className="post-info-desc">
              {postType === 'text' ? t('moltbook.post.textPostDesc') : t('moltbook.post.linkPostDesc')}
            </p>
            <div className="post-info-tips">
              <div className="tip-item">
                <span className="tip-icon">💡</span>
                <span>{postType === 'text' ? 'Use clear, engaging titles' : 'Share interesting articles'}</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span>{postType === 'text' ? 'Markdown formatting supported' : 'URL will be validated'}</span>
              </div>
            </div>
          </div>

          {/* AI Generation Card - Only for text posts */}
          {postType === 'text' && (
            <div className="ai-generate-card">
              <div className="ai-card-header">
                <div className="ai-card-badge">AI</div>
                <h3 className="ai-card-title">{t('moltbook.post.aiGenerateSection')}</h3>
              </div>

              <div className="ai-card-body">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={t('moltbook.post.aiPromptPlaceholder')}
                  className="ai-prompt-input"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleAIGenerate()
                    }
                  }}
                />

                <div className="ai-model-select">
                  <ModelSelector
                    value={selectedModel}
                    onChange={handleModelChange}
                  />
                </div>

                <button
                  type="button"
                  className="ai-generate-btn"
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !openrouterApiKey}
                >
                  {aiLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      {t('moltbook.post.aiGenerating')}
                    </>
                  ) : (
                    <>
                      <span className="ai-btn-icon">✨</span>
                      {t('moltbook.post.aiGenerate')}
                    </>
                  )}
                </button>

                {!openrouterApiKey && (
                  <div className="ai-config-hint">
                    <span className="hint-icon">💡</span>
                    <span>
                      {t('moltbook.post.aiConfigHint')}{' '}
                      <Link to="/settings" className="hint-link">
                        {t('moltbook.post.goToSettings')}
                      </Link>
                    </span>
                  </div>
                )}

                {aiStatus && (
                  <div className="ai-status-wrapper">
                    <StatusMessage message={aiStatus.message} type={aiStatus.type} />
                  </div>
                )}

                <div className="ai-shortcut-hint">
                  <kbd>⌘</kbd> + <kbd>Enter</kbd> to generate
                </div>
              </div>
            </div>
          )}

          {/* Rate Limit Notice */}
          <div className="post-notice">
            <div className="notice-icon">ℹ️</div>
            <div className="notice-content">{t('moltbook.post.rateLimit')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
