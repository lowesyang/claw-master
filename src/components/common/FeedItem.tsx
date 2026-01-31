import { Post, SearchResult } from '../../types'
import { formatTime, escapeHtml } from '../../utils/helpers'

interface FeedItemProps {
  post?: Post
  searchResult?: SearchResult
}

export function FeedItem({ post, searchResult }: FeedItemProps) {
  if (searchResult) {
    return (
      <div className="feed-item">
        <div className="feed-item-header">
          <span className="feed-item-submolt">
            {searchResult.type === 'post' ? '📝 帖子' : '💬 评论'}
          </span>
          <span className="feed-item-time">
            相似度: {(searchResult.similarity * 100).toFixed(0)}%
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

  const submoltName =
    typeof post.submolt === 'object' ? post.submolt?.name : post.submolt || 'general'

  return (
    <div className="feed-item">
      <div className="feed-item-header">
        <span className="feed-item-submolt">m/{submoltName}</span>
        <span className="feed-item-time">{formatTime(post.created_at)}</span>
      </div>
      <div className="feed-item-title">{escapeHtml(post.title)}</div>
      {post.content && (
        <div className="feed-item-content">
          {escapeHtml(post.content).substring(0, 200)}
          {post.content.length > 200 ? '...' : ''}
        </div>
      )}
      {post.url && (
        <div className="feed-item-content">
          <a
            href={escapeHtml(post.url)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            {escapeHtml(post.url)}
          </a>
        </div>
      )}
      <div className="feed-item-footer">
        <span>👤 {post.author?.name || 'Anonymous'}</span>
        <span>⬆️ {post.upvotes || 0}</span>
        <span>💬 {post.comment_count || 0}</span>
      </div>
    </div>
  )
}
