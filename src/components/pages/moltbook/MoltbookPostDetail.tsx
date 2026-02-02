import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { getPost, getPostComments, upvotePost, downvotePost, removeUpvote, removeDownvote } from '../../../services/api'
import { Post } from '../../../types'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'
import { formatTime, escapeHtml } from '../../../utils/helpers'

interface Comment {
  id: string
  content: string
  author?: { name: string }
  upvotes?: number
  created_at?: string
}

export function MoltbookPostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const { isLoggedIn, apiKey } = useAuth()
  const { t } = useLanguage()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState<'up' | 'down' | null>(null)
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId, apiKey])

  const loadPost = async () => {
    if (!postId) return
    setLoading(true)
    setError(null)

    try {
      const [postData, commentsData] = await Promise.all([
        getPost(postId, apiKey),
        getPostComments(postId, apiKey).catch(() => ({ comments: [] })),
      ])
      setPost(postData)
      setComments(commentsData.comments || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    const pid = post?.id || post?._id
    if (!post || !pid || !apiKey || voting) return

    setVoting('up')
    try {
      if (voteState === 'up') {
        await removeUpvote(pid, apiKey)
        setVoteState(null)
        setPost({ ...post, upvotes: (post.upvotes ?? 0) - 1 })
      } else {
        await upvotePost(pid, apiKey)
        const adjustment = voteState === 'down' ? 2 : 1
        setVoteState('up')
        setPost({ ...post, upvotes: (post.upvotes ?? 0) + adjustment })
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setVoting(null)
    }
  }

  const handleDownvote = async () => {
    const pid = post?.id || post?._id
    if (!post || !pid || !apiKey || voting) return

    setVoting('down')
    try {
      if (voteState === 'down') {
        await removeDownvote(pid, apiKey)
        setVoteState(null)
        setPost({ ...post, upvotes: (post.upvotes ?? 0) + 1 })
      } else {
        await downvotePost(pid, apiKey)
        const adjustment = voteState === 'up' ? 2 : 1
        setVoteState('down')
        setPost({ ...post, upvotes: (post.upvotes ?? 0) - adjustment })
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setVoting(null)
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.postDetail.title') || 'Post Detail'}</h1>
        </div>
        <Alert icon="⚠️" title={t('moltbook.feed.loginRequired')} type="warning">
          {t('moltbook.feed.loginDescBefore')} <Link to="/moltbook/setup" style={{ color: 'var(--accent)' }}>{t('moltbook.feed.setupApiKey')}</Link> {t('moltbook.feed.loginDescAfter')}
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.postDetail.title') || 'Post Detail'}</h1>
        </div>
        <Loading />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.postDetail.title') || 'Post Detail'}</h1>
        </div>
        <EmptyState icon="❌" message={error || t('moltbook.postDetail.notFound') || 'Post not found'} />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/moltbook/feed" className="btn-small btn-secondary">
            ← {t('common.back') || 'Back'}
          </Link>
        </div>
      </div>
    )
  }

  const submoltName = typeof post.submolt === 'object' ? post.submolt?.name : post.submolt || 'general'

  return (
    <div>
      <div className="page-header">
        <Link to="/moltbook/feed" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>
          ← {t('moltbook.postDetail.backToFeed') || 'Back to Feed'}
        </Link>
        <h1 className="page-title" style={{ color: 'var(--accent)' }}>🦞 {t('moltbook.postDetail.title') || 'Post Detail'}</h1>
      </div>

      {/* Post card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Vote buttons */}
          {apiKey && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '50px',
            }}>
              <button
                onClick={handleUpvote}
                disabled={voting !== null}
                title={t('feed.upvote') || 'Upvote'}
                style={{
                  background: voteState === 'up' ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                  border: voteState === 'up' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  cursor: voting ? 'wait' : 'pointer',
                  fontSize: '1.4rem',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  color: voteState === 'up' ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                ▲
              </button>
              <span style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: voteState === 'up' ? 'var(--accent)' : voteState === 'down' ? '#ef4444' : 'var(--text-primary)',
              }}>
                {post.upvotes ?? 0}
              </span>
              <button
                onClick={handleDownvote}
                disabled={voting !== null}
                title={t('feed.downvote') || 'Downvote'}
                style={{
                  background: voteState === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                  border: voteState === 'down' ? '1px solid #ef4444' : '1px solid var(--border)',
                  cursor: voting ? 'wait' : 'pointer',
                  fontSize: '1.4rem',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  color: voteState === 'down' ? '#ef4444' : 'var(--text-tertiary)',
                }}
              >
                ▼
              </button>
            </div>
          )}

          {/* Post content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}>
                m/{submoltName}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                👤 {post.author?.name || 'Anonymous'}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                🕐 {formatTime(post.created_at)}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {escapeHtml(post.title)}
            </h2>

            {post.content && (
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                marginBottom: '16px',
              }}>
                {escapeHtml(post.content)}
              </div>
            )}

            {post.url && (
              <div style={{ marginBottom: '16px' }}>
                <a
                  href={escapeHtml(post.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🔗 {escapeHtml(post.url)}
                </a>
              </div>
            )}

            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              💬 {post.comment_count || comments.length} {t('feed.comments') || 'comments'}
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          💬 {t('moltbook.postDetail.comments') || 'Comments'} ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <EmptyState icon="💬" message={t('moltbook.postDetail.noComments') || 'No comments yet'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    👤 {comment.author?.name || 'Anonymous'}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    🕐 {formatTime(comment.created_at)}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    ⬆️ {comment.upvotes ?? 0}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {escapeHtml(comment.content)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
