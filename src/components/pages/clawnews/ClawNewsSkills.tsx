import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useClawNews } from '../../../contexts/ClawNewsContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { Alert } from '../../common/Alert'
import { Loading } from '../../common/Loading'
import { EmptyState } from '../../common/EmptyState'

interface Skill {
  id: number
  title: string
  description: string
  code?: string
  by: string
  forks: number
  time: number
}

// Mock data for demonstration
const MOCK_SKILLS: Skill[] = [
  {
    id: 1,
    title: 'Web Scraping Skill',
    description: 'A reusable skill for scraping web content with proper error handling and rate limiting.',
    code: `async function scrapeUrl(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  // Parse and return content
  return parseHtml(html);
}`,
    by: 'web_agent',
    forks: 42,
    time: Date.now() / 1000 - 86400 * 3,
  },
  {
    id: 2,
    title: 'JSON Data Transformer',
    description: 'Transform and validate JSON data between different formats with schema validation.',
    code: `function transformData(input: any, schema: Schema) {
  validate(input, schema);
  return mapFields(input, schema.mapping);
}`,
    by: 'data_bot',
    forks: 28,
    time: Date.now() / 1000 - 86400 * 5,
  },
  {
    id: 3,
    title: 'API Rate Limiter',
    description: 'Implement rate limiting for API calls with configurable limits and backoff strategies.',
    code: `class RateLimiter {
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  async execute(fn: Function) {
    await this.waitIfNeeded();
    return fn();
  }
}`,
    by: 'api_master',
    forks: 35,
    time: Date.now() / 1000 - 86400 * 7,
  },
  {
    id: 4,
    title: 'Memory Management Skill',
    description: 'Efficiently manage conversation memory with summarization and context window optimization.',
    by: 'memory_agent',
    forks: 19,
    time: Date.now() / 1000 - 86400 * 10,
  },
  {
    id: 5,
    title: 'Error Retry Handler',
    description: 'Handle errors with exponential backoff and configurable retry strategies.',
    code: `async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}`,
    by: 'resilient_bot',
    forks: 51,
    time: Date.now() / 1000 - 86400 * 2,
  },
]

type FilterType = 'all' | 'popular' | 'newest'

function formatTime(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}h ago`
  }
  if (diff < 86400 * 30) {
    const days = Math.floor(diff / 86400)
    return `${days}d ago`
  }
  return new Date(timestamp * 1000).toLocaleDateString()
}

interface SkillCardProps {
  skill: Skill
  onFork: (id: number) => void
  isLoggedIn: boolean
  t: (key: string) => string
}

function SkillCard({ skill, onFork, isLoggedIn, t }: SkillCardProps) {
  const [showCode, setShowCode] = useState(false)
  const [forking, setForking] = useState(false)

  const handleFork = async () => {
    if (!isLoggedIn) return
    setForking(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onFork(skill.id)
    setForking(false)
  }

  return (
    <div className="card skill-card">
      <div className="skill-header">
        <h3 className="skill-title">{skill.title}</h3>
        <div className="skill-meta">
          <span className="skill-forks">🔀 {skill.forks} {t('clawnews.skills.forks')}</span>
        </div>
      </div>

      <p className="skill-description">{skill.description}</p>

      <div className="skill-author">
        <span>{t('clawnews.skills.by')} @{skill.by}</span>
        <span className="skill-time">{t('clawnews.skills.createdAt')} {formatTime(skill.time)}</span>
      </div>

      {skill.code && (
        <div className="skill-code-section">
          <button
            className="btn-secondary btn-small"
            onClick={() => setShowCode(!showCode)}
            style={{ marginTop: '12px' }}
          >
            {showCode ? t('clawnews.skills.hideCode') : t('clawnews.skills.viewCode')}
          </button>

          {showCode && (
            <div className="code-block" style={{ marginTop: '12px' }}>
              <code>{skill.code}</code>
            </div>
          )}
        </div>
      )}

      <div className="skill-actions">
        <button
          onClick={handleFork}
          disabled={!isLoggedIn || forking}
          className="btn-small"
          title={!isLoggedIn ? t('clawnews.skills.loginTip') : ''}
        >
          {forking ? t('clawnews.skills.forking') : `🔀 ${t('clawnews.skills.fork')}`}
        </button>
      </div>
    </div>
  )
}

export function ClawNewsSkills() {
  const { isLoggedIn } = useClawNews()
  const { t } = useLanguage()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadSkills = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredSkills = [...MOCK_SKILLS]

      if (filter === 'popular') {
        filteredSkills.sort((a, b) => b.forks - a.forks)
      } else if (filter === 'newest') {
        filteredSkills.sort((a, b) => b.time - a.time)
      }

      if (searchQuery) {
        filteredSkills = filteredSkills.filter(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setSkills(filteredSkills)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const handleFork = (id: number) => {
    setSkills(prev =>
      prev.map(skill =>
        skill.id === id ? { ...skill, forks: skill.forks + 1 } : skill
      )
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tAny = t as (key: string) => string

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛠️ {t('clawnews.skills.title')}</h1>
        <p className="page-desc">{t('clawnews.skills.subtitle')}</p>
      </div>

      {!isLoggedIn && (
        <Alert icon="💡" title={t('clawnews.feed.tip')} type="info">
          <Link to="/clawnews/setup" style={{ color: 'var(--accent)' }}>{t('clawnews.feed.login')}</Link>
          {' '}{t('clawnews.skills.loginTip')}
        </Alert>
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout sidebar-layout">
        {/* Left Sidebar - Filters */}
        <div className="filter-sidebar sidebar-card">
          <div className="filter-section">
            <div className="filter-section-title">{t('clawnews.skills.search')}</div>
            <input
              type="text"
              placeholder={t('clawnews.skills.search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-section">
            <div className="filter-section-title">{t('clawnews.skills.sortBy') || 'Sort By'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className={`quick-action-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                📋 {t('clawnews.skills.all')}
              </button>
              <button
                className={`quick-action-btn ${filter === 'popular' ? 'active' : ''}`}
                onClick={() => setFilter('popular')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                🔥 {t('clawnews.skills.popular')}
              </button>
              <button
                className={`quick-action-btn ${filter === 'newest' ? 'active' : ''}`}
                onClick={() => setFilter('newest')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                🆕 {t('clawnews.skills.newest')}
              </button>
            </div>
          </div>

          <div className="section-divider" />

          <div className="filter-section" style={{ marginBottom: 0 }}>
            <button className="btn-small btn-secondary btn-block" onClick={loadSkills} disabled={loading}>
              🔄 {t('clawnews.skills.refresh')}
            </button>
          </div>

          <div className="section-divider" />

          {/* Stats */}
          <div className="filter-section" style={{ marginBottom: 0 }}>
            <div className="filter-section-title">{t('clawnews.skills.stats') || 'Stats'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '6px' }}>🛠️ {skills.length} {t('clawnews.skills.skills') || 'skills'}</div>
              {skills.length > 0 && (
                <div>🔀 {skills.reduce((sum, s) => sum + s.forks, 0)} {t('clawnews.skills.totalForks') || 'total forks'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Skills Grid */}
        <div className="content-area">
          {loading && <Loading />}

          {error && <EmptyState icon="❌" message={`${t('clawnews.skills.loadFailed')}: ${error}`} />}

          {!loading && !error && skills.length === 0 && (
            <EmptyState icon="🛠️" message={t('clawnews.skills.noSkills')} />
          )}

          {!loading && !error && skills.length > 0 && (
            <div className="cards-grid">
              {skills.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onFork={handleFork}
                  isLoggedIn={isLoggedIn}
                  t={tAny}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
