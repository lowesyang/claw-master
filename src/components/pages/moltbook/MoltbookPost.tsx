import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { apiRequest, generateAIContent, generateAITitle } from '../../../services/api'
import { Alert } from '../../common/Alert'
import { StatusMessage } from '../../common/StatusMessage'

type PostType = 'text' | 'link'

export function MoltbookPost() {
  const { isLoggedIn, apiKey, openrouterApiKey, aiModel } = useAuth()
  const { t } = useLanguage()

  const [postType, setPostType] = useState<PostType>('text')
  const [submolt, setSubmolt] = useState('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [aiStatus, setAiStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

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

    if (!aiPrompt.trim() && !title.trim()) {
      setAiStatus({ message: t('moltbook.post.enterTopicOrTitle'), type: 'error' })
      return
    }

    setAiLoading(true)
    setAiStatus(null)

    try {
      const topic = aiPrompt.trim() || title.trim()
      const generatedContent = await generateAIContent(
        openrouterApiKey,
        aiModel,
        topic,
        submolt || 'general'
      )
      setContent(generatedContent)

      // Generate title if empty
      if (!title.trim() && aiPrompt.trim()) {
        const generatedTitle = await generateAITitle(openrouterApiKey, aiModel, generatedContent)
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
      <div>
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
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.post.title')}</h1>
        <p className="page-desc">{t('moltbook.post.subtitle')}</p>
      </div>

      <div className="card">
        {status && <StatusMessage message={status.message} type={status.type} />}

        <div className="post-type-selector">
          <div
            className={`post-type-btn ${postType === 'text' ? 'active' : ''}`}
            onClick={() => setPostType('text')}
          >
            📄 {t('moltbook.post.textPost')}
          </div>
          <div
            className={`post-type-btn ${postType === 'link' ? 'active' : ''}`}
            onClick={() => setPostType('link')}
          >
            🔗 {t('moltbook.post.linkPost')}
          </div>
        </div>

        <div className="form-group">
          <label>{t('moltbook.post.submoltLabel')}</label>
          <input
            type="text"
            value={submolt}
            onChange={(e) => setSubmolt(e.target.value)}
            placeholder="general"
          />
        </div>

        <div className="form-group">
          <label>{t('moltbook.post.titleLabel')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hello Moltbook!"
          />
        </div>

        {postType === 'text' && (
          <div className="form-group">
            <label>{t('moltbook.post.contentLabel')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('moltbook.post.contentPlaceholder')}
            />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t('moltbook.post.aiPromptPlaceholder')}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              />
              <button
                type="button"
                className="btn-small"
                style={{ whiteSpace: 'nowrap' }}
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? `⏳ ${t('moltbook.post.aiGenerating')}` : `✨ ${t('moltbook.post.aiGenerate')}`}
              </button>
            </div>
            {aiStatus && (
              <div style={{ marginTop: '8px' }}>
                <StatusMessage message={aiStatus.message} type={aiStatus.type} />
              </div>
            )}
          </div>
        )}

        {postType === 'link' && (
          <div className="form-group">
            <label>{t('moltbook.post.urlLabel')}</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        )}

        <Alert icon="ℹ️" title="" type="info">
          {t('moltbook.post.rateLimit')}
        </Alert>

        <button className="btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? t('moltbook.post.posting') : t('moltbook.post.submit')}
        </button>
      </div>
    </div>
  )
}
