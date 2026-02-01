import { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { StatusMessage } from '../../common/StatusMessage'

// 所有请求走代理（避免 CORS 问题）
const CLAWNCH_PROXY = '/api/clawnch/proxy'
const MOLTBOOK_API_BASE = 'https://www.moltbook.com/api/v1'  // Moltbook 支持 CORS，直接调用

interface TokenData {
  name: string
  symbol: string
  wallet: string
  description: string
  image: string
}

export function ClawnchLaunch() {
  const { t } = useLanguage()
  const [moltbookKey, setMoltbookKey] = useState('')
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    wallet: '',
    description: '',
    image: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  useEffect(() => {
    // Load moltbook key from current agent
    const stored = localStorage.getItem('clawnch_agents')
    if (stored) {
      try {
        const agents = JSON.parse(stored)
        if (agents.length > 0) {
          setMoltbookKey(agents[0].moltbookKey)
        }
      } catch (e) {
        console.error('Failed to load agent:', e)
      }
    }
  }, [])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      setStatus({ type: 'error', message: t('clawnch.launch.selectImage') })
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1]
        // 所有请求走代理
        const response = await fetch(`${CLAWNCH_PROXY}?path=${encodeURIComponent('/api/upload')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            name: tokenData.symbol || 'token-logo'
          })
        })

        const data = await response.json()
        if (data.success) {
          setTokenData({ ...tokenData, image: data.url })
          setStatus({ type: 'success', message: t('clawnch.launch.imageUploaded') })
        } else {
          throw new Error(data.error || 'Upload failed')
        }
      }
      reader.readAsDataURL(imageFile)
    } catch (error) {
      setStatus({ type: 'error', message: `${t('clawnch.launch.uploadFailed')}: ${error}` })
    } finally {
      setUploading(false)
    }
  }

  const handleLaunch = async () => {
    if (!moltbookKey) {
      setStatus({ type: 'error', message: t('clawnch.launch.noMoltbookKey') })
      return
    }

    if (!tokenData.name || !tokenData.symbol || !tokenData.wallet || !tokenData.description || !tokenData.image) {
      setStatus({ type: 'error', message: t('clawnch.launch.fillAllFields') })
      return
    }

    setLaunching(true)
    try {
      // First, create a post on Moltbook with the token data
      const postResponse = await fetch(`${MOLTBOOK_API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${moltbookKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submolt: 'clawnch',
          title: `Launching ${tokenData.name} ($${tokenData.symbol})`,
          content: `!clawnch\n\`\`\`json\n${JSON.stringify(tokenData, null, 2)}\n\`\`\``
        })
      })

      if (!postResponse.ok) {
        throw new Error('Failed to create Moltbook post')
      }

      const postData = await postResponse.json()
      const postId = postData.post?.id

      if (!postId) {
        throw new Error('No post ID returned')
      }

      // Then launch via Clawnch API (走代理)
      const launchResponse = await fetch(`${CLAWNCH_PROXY}?path=${encodeURIComponent('/api/launch')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moltbook_key: moltbookKey,
          post_id: postId
        })
      })

      const launchData = await launchResponse.json()

      if (launchData.success) {
        setStatus({
          type: 'success',
          message: t('clawnch.launch.launchSuccess')
        })
        // Reset form
        setTokenData({
          name: '',
          symbol: '',
          wallet: '',
          description: '',
          image: '',
        })
        setImageFile(null)
        setImagePreview('')
      } else {
        throw new Error(launchData.error || 'Launch failed')
      }
    } catch (error) {
      setStatus({ type: 'error', message: `${t('clawnch.launch.launchFailed')}: ${error}` })
    } finally {
      setLaunching(false)
    }
  }

  const isLoggedIn = !!moltbookKey

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          {t('clawnch.launch.title')}
        </h1>
        <p className="page-desc">
          {t('clawnch.launch.subtitle')}
        </p>
      </div>

      {status && (
        <StatusMessage
          type={status.type}
          message={status.message}
          onClose={() => setStatus(null)}
        />
      )}

      {!isLoggedIn && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <div className="alert-title">{t('clawnch.launch.notLoggedIn')}</div>
            <div className="alert-text">{t('clawnch.launch.notLoggedInDesc')}</div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-right" style={{
        opacity: isLoggedIn ? 1 : 0.5,
        pointerEvents: isLoggedIn ? 'auto' : 'none',
      }}>
        {/* Left Column - Form Fields */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title">
            🪙 {t('clawnch.launch.tokenInfo')}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>{t('clawnch.launch.tokenName')} *</label>
              <input
                type="text"
                value={tokenData.name}
                onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
                placeholder={t('clawnch.launch.tokenNamePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('clawnch.launch.symbol')} *</label>
              <input
                type="text"
                value={tokenData.symbol}
                onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
                placeholder={t('clawnch.launch.symbolPlaceholder')}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group full-width">
              <label>{t('clawnch.launch.wallet')} *</label>
              <input
                type="text"
                value={tokenData.wallet}
                onChange={(e) => setTokenData({ ...tokenData, wallet: e.target.value })}
                placeholder={t('clawnch.launch.walletPlaceholder')}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <div className="form-group full-width">
              <label>{t('clawnch.launch.description')} *</label>
              <textarea
                value={tokenData.description}
                onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
                placeholder={t('clawnch.launch.descriptionPlaceholder')}
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>

          {/* Launch Button */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleLaunch}
              disabled={launching || !tokenData.name || !tokenData.symbol || !tokenData.wallet || !tokenData.description || !tokenData.image}
              className="btn-block"
              style={{
                opacity: (launching || !tokenData.name || !tokenData.symbol || !tokenData.wallet || !tokenData.description || !tokenData.image) ? 0.5 : 1,
                cursor: launching ? 'not-allowed' : 'pointer',
              }}
            >
              {launching ? t('clawnch.launch.launching') : t('clawnch.launch.launchButton')}
            </button>
          </div>
        </div>

        {/* Right Column - Image Upload & Info */}
        <div className="sidebar-card">
          {/* Image Upload Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">
              🖼️ {t('clawnch.launch.image')} *
            </div>

            {/* Image Preview Area */}
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(131, 83, 255, 0.1) 0%, rgba(197, 57, 249, 0.1) 100%)',
              border: '2px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative',
            }}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontSize: '0.9rem' }}>{t('clawnch.launch.selectImage')}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-small btn-secondary"
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
              >
                {t('clawnch.launch.selectImage')}
              </label>

              {imageFile && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="btn-small"
                  style={{
                    flex: 1,
                    opacity: uploading ? 0.7 : 1,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? t('clawnch.launch.uploading') : t('clawnch.launch.upload')}
                </button>
              )}
            </div>

            {tokenData.image && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: 'rgba(7, 181, 106, 0.1)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--success)',
                wordBreak: 'break-all',
              }}>
                ✓ {t('clawnch.launch.imageUploaded')}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="alert alert-info" style={{ margin: 0 }}>
            <span className="alert-icon">ℹ️</span>
            <div className="alert-content">
              <div className="alert-title">{t('clawnch.launch.infoTitle')}</div>
              <div className="alert-text">{t('clawnch.launch.infoText')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
