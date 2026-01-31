import { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { StatusMessage } from '../../common/StatusMessage'

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
        const response = await fetch('/api/clawnch/upload', {
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
      const postResponse = await fetch('https://www.moltbook.com/api/v1/posts', {
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

      // Then launch via Clawnch API
      const launchResponse = await fetch('/api/clawnch/launch', {
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
      <div style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {t('clawnch.launch.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
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
        <div style={{
          padding: '24px',
          background: 'rgba(240, 136, 0, 0.08)',
          border: '1px solid var(--warning)',
          borderRadius: '16px',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--warning)' }}>
                {t('clawnch.launch.notLoggedIn')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('clawnch.launch.notLoggedInDesc')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Launch Form */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--border)',
        opacity: isLoggedIn ? 1 : 0.5,
        pointerEvents: isLoggedIn ? 'auto' : 'none',
      }}>
        {/* Token Info */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
            {t('clawnch.launch.tokenInfo')}
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('clawnch.launch.tokenName')} *
            </label>
            <input
              type="text"
              value={tokenData.name}
              onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
              placeholder={t('clawnch.launch.tokenNamePlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('clawnch.launch.symbol')} *
            </label>
            <input
              type="text"
              value={tokenData.symbol}
              onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
              placeholder={t('clawnch.launch.symbolPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('clawnch.launch.wallet')} *
            </label>
            <input
              type="text"
              value={tokenData.wallet}
              onChange={(e) => setTokenData({ ...tokenData, wallet: e.target.value })}
              placeholder={t('clawnch.launch.walletPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('clawnch.launch.description')} *
            </label>
            <textarea
              value={tokenData.description}
              onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
              placeholder={t('clawnch.launch.descriptionPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                minHeight: '120px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('clawnch.launch.image')} *
            </label>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                style={{
                  padding: '12px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}
              >
                {t('clawnch.launch.selectImage')}
              </label>
              
              {imageFile && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {uploading ? t('clawnch.launch.uploading') : t('clawnch.launch.upload')}
                </button>
              )}
            </div>

            {imagePreview && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            )}

            {tokenData.image && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--success)' }}>
                ✓ {t('clawnch.launch.imageUploaded')}: {tokenData.image}
              </div>
            )}
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={launching || !tokenData.name || !tokenData.symbol || !tokenData.wallet || !tokenData.description || !tokenData.image}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #8353ff 0%, #c539f9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: launching ? 'not-allowed' : 'pointer',
            opacity: launching ? 0.7 : 1,
          }}
        >
          {launching ? t('clawnch.launch.launching') : t('clawnch.launch.launchButton')}
        </button>
      </div>

      {/* Info */}
      <div style={{
        padding: '20px',
        background: 'rgba(57, 158, 247, 0.08)',
        border: '1px solid var(--info)',
        borderRadius: '12px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--info)' }}>
              {t('clawnch.launch.infoTitle')}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {t('clawnch.launch.infoText')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
