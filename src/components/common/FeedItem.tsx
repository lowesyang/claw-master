import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Post, SearchResult } from '../../types'
import { formatTime, escapeHtml } from '../../utils/helpers'
import { upvotePost, downvotePost, removeUpvote, removeDownvote } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

interface FeedItemProps {
  post?: Post
  searchResult?: SearchResult
  platform?: 'moltbook' | 'clawnews'
  showVoteButtons?: boolean
  onVoteChange?: (postId: string, newUpvotes: number) => void
}

export function FeedItem({ post, searchResult, platform = 'moltbook', showVoteButtons = true, onVoteChange }: FeedItemProps) {
  const { apiKey } = useAuth()
  const { t } = useLanguage()
  const [voting, setVoting] = useState<'up' | 'down' | null>(null)
  const [localUpvotes, setLocalUpvotes] = useState<number | null>(null)
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null)

  const getPostId = () => post?.id || post?._id

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pid = getPostId()
    if (!post || !pid || !apiKey || voting) return

    setVoting('up')
    try {
      if (voteState === 'up') {
        // Remove upvote
        await removeUpvote(pid, apiKey)
        setVoteState(null)
        const newUpvotes = (localUpvotes ?? post.upvotes ?? 0) - 1
        setLocalUpvotes(newUpvotes)
        onVoteChange?.(pid, newUpvotes)
      } else {
        // If previously downvoted, that vote is replaced
        await upvotePost(pid, apiKey)
        const adjustment = voteState === 'down' ? 2 : 1
        setVoteState('up')
        const newUpvotes = (localUpvotes ?? post.upvotes ?? 0) + adjustment
        setLocalUpvotes(newUpvotes)
        onVoteChange?.(pid, newUpvotes)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setVoting(null)
    }
  }

  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pid = getPostId()
    if (!post || !pid || !apiKey || voting) return

    setVoting('down')
    try {
      if (voteState === 'down') {
        // Remove downvote
        await removeDownvote(pid, apiKey)
        setVoteState(null)
        const newUpvotes = (localUpvotes ?? post.upvotes ?? 0) + 1
        setLocalUpvotes(newUpvotes)
        onVoteChange?.(pid, newUpvotes)
      } else {
        // If previously upvoted, that vote is replaced
        await downvotePost(pid, apiKey)
        const adjustment = voteState === 'up' ? 2 : 1
        setVoteState('down')
        const newUpvotes = (localUpvotes ?? post.upvotes ?? 0) - adjustment
        setLocalUpvotes(newUpvotes)
        onVoteChange?.(pid, newUpvotes)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setVoting(null)
    }
  }

  if (searchResult) {
    return (
      <div className="feed-item">
        <div className="feed-item-header">
          <span className="feed-item-submolt">
            {searchResult.type === 'post' ? '📝 Post' : '💬 Comment'}
          </span>
          <span className="feed-item-time">
            {t('moltbook.search.similarity') || 'Similarity'}: {(searchResult.similarity * 100).toFixed(0)}%
          </span>
        </div>
        {searchResult.title && (
          <div className="feed-item-title">{escapeHtml(searchResult.title)}</div>
        )}
        <div className="feed-item-content">
          {escapeHtml(searchResult.content || '').substring(0, 200)}
          {(searchResult.content || '').length > 200 ? '...' : ''}
        </div>
        <div className="feed-item-footer">
          <span>👤 {searchResult.author?.name || 'Anonymous'}</span>
          <span>⬆️ {searchResult.upvotes || 0}</span>
        </div>
      </div>
    )
  }

  if (!post) return null

  const postId = post.id || post._id
  const submoltName =
    typeof post.submolt === 'object' ? post.submolt?.name : post.submolt || 'general'
  const displayUpvotes = localUpvotes ?? post.upvotes ?? 0
  const detailPath = platform === 'moltbook' ? `/moltbook/post/${postId}` : `/clawnews/post/${postId}`

  return (
    <div className="feed-item" style={{ display: 'flex', gap: '12px' }}>
      {/* Vote buttons column */}
      {showVoteButtons && apiKey && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          minWidth: '40px',
          paddingTop: '4px',
        }}>
          <button
            onClick={handleUpvote}
            disabled={voting !== null}
            title={t('feed.upvote') || 'Upvote'}
            style={{
              background: 'none',
              border: 'none',
              cursor: voting ? 'wait' : 'pointer',
              fontSize: '1.2rem',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              color: voteState === 'up' ? 'var(--accent)' : 'var(--text-tertiary)',
              transform: voteState === 'up' ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ▲
          </button>
          <span style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: voteState === 'up' ? 'var(--accent)' : voteState === 'down' ? '#ef4444' : 'var(--text-secondary)',
          }}>
            {displayUpvotes}
          </span>
          <button
            onClick={handleDownvote}
            disabled={voting !== null}
            title={t('feed.downvote') || 'Downvote'}
            style={{
              background: 'none',
              border: 'none',
              cursor: voting ? 'wait' : 'pointer',
              fontSize: '1.2rem',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              color: voteState === 'down' ? '#ef4444' : 'var(--text-tertiary)',
              transform: voteState === 'down' ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ▼
          </button>
        </div>
      )}

      {/* Post content column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="feed-item-header">
          <span className="feed-item-submolt">m/{submoltName}</span>
          <span className="feed-item-time">{formatTime(post.created_at)}</span>
        </div>
        <Link to={detailPath} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feed-item-title" style={{ cursor: 'pointer' }}>
            {escapeHtml(post.title)}
          </div>
        </Link>
        {post.content && (
          <Link to={detailPath} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feed-item-content" style={{ cursor: 'pointer' }}>
              {escapeHtml(post.content).substring(0, 200)}
              {post.content.length > 200 ? '...' : ''}
            </div>
          </Link>
        )}
        {post.url && (
          <div className="feed-item-content">
            <a
              href={escapeHtml(post.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
              onClick={(e) => e.stopPropagation()}
            >
              🔗 {escapeHtml(post.url)}
            </a>
          </div>
        )}
        <div className="feed-item-footer">
          <span>👤 {post.author?.name || 'Anonymous'}</span>
          {!showVoteButtons && <span>⬆️ {displayUpvotes}</span>}
          <Link to={detailPath} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span style={{ cursor: 'pointer' }}>💬 {post.comment_count || 0} {t('feed.comments') || 'comments'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
