import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { PLATFORM_SKILLS, PlatformSkill } from '../types'

const STORAGE_KEY = 'agent_skill_config'

const DEFAULT_SKILL: PlatformSkill = {
  platform: 'moltbook',
  skillUrl: '',
  enabled: false,
  heartbeatInterval: 4,
  autoPost: false,
  autoComment: true,
  autoUpvote: true,
}

interface AgentSkillContextValue {
  config: PlatformSkill
  setConfig: React.Dispatch<React.SetStateAction<PlatformSkill>>
  isRunning: boolean
  startAgent: () => void
  stopAgent: () => void
  toggleAgent: () => void
  clearConfig: () => void
}

const AgentSkillMoltbookContext = createContext<AgentSkillContextValue | null>(
  null
)
const AgentSkillClawnewsContext = createContext<AgentSkillContextValue | null>(
  null
)

export function AgentSkillProvider({ children }: { children: ReactNode }) {
  const [moltbookState, setMoltbookState] = useState<PlatformSkill>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_moltbook`)
      if (saved) {
        const defaultSkill =
          PLATFORM_SKILLS.moltbook ?? { ...DEFAULT_SKILL, platform: 'moltbook' }
        return { ...defaultSkill, ...JSON.parse(saved) }
      }
    } catch {
      // ignore
    }
    return PLATFORM_SKILLS.moltbook ?? { ...DEFAULT_SKILL, platform: 'moltbook' }
  })

  const [clawnewsState, setClawnewsState] = useState<PlatformSkill>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clawnews`)
      if (saved) {
        const defaultSkill =
          PLATFORM_SKILLS.clawnews ?? { ...DEFAULT_SKILL, platform: 'clawnews' }
        return { ...defaultSkill, ...JSON.parse(saved) }
      }
    } catch {
      // ignore
    }
    return PLATFORM_SKILLS.clawnews ?? { ...DEFAULT_SKILL, platform: 'clawnews' }
  })

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_moltbook`, JSON.stringify(moltbookState))
  }, [moltbookState])

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}_clawnews`,
      JSON.stringify(clawnewsState)
    )
  }, [clawnewsState])

  const moltbookValue: AgentSkillContextValue = {
    config: moltbookState,
    setConfig: setMoltbookState,
    isRunning: moltbookState.enabled,
    startAgent: useCallback(() => {
      setMoltbookState(prev => ({
        ...prev,
        enabled: true,
        lastHeartbeat: new Date().toISOString(),
      }))
    }, []),
    stopAgent: useCallback(() => {
      setMoltbookState(prev => ({ ...prev, enabled: false }))
    }, []),
    toggleAgent: useCallback(() => {
      setMoltbookState(prev => {
        const nextEnabled = !prev.enabled
        return {
          ...prev,
          enabled: nextEnabled,
          ...(nextEnabled
            ? { lastHeartbeat: new Date().toISOString() }
            : {}),
        }
      })
    }, []),
    clearConfig: useCallback(() => {
      const defaultSkill =
        PLATFORM_SKILLS.moltbook ?? { ...DEFAULT_SKILL, platform: 'moltbook' }
      setMoltbookState({ ...defaultSkill, enabled: false })
      localStorage.removeItem(`${STORAGE_KEY}_moltbook`)
    }, []),
  }

  const clawnewsValue: AgentSkillContextValue = {
    config: clawnewsState,
    setConfig: setClawnewsState,
    isRunning: clawnewsState.enabled,
    startAgent: useCallback(() => {
      setClawnewsState(prev => ({
        ...prev,
        enabled: true,
        lastHeartbeat: new Date().toISOString(),
      }))
    }, []),
    stopAgent: useCallback(() => {
      setClawnewsState(prev => ({ ...prev, enabled: false }))
    }, []),
    toggleAgent: useCallback(() => {
      setClawnewsState(prev => {
        const nextEnabled = !prev.enabled
        return {
          ...prev,
          enabled: nextEnabled,
          ...(nextEnabled
            ? { lastHeartbeat: new Date().toISOString() }
            : {}),
        }
      })
    }, []),
    clearConfig: useCallback(() => {
      const defaultSkill =
        PLATFORM_SKILLS.clawnews ?? { ...DEFAULT_SKILL, platform: 'clawnews' }
      setClawnewsState({ ...defaultSkill, enabled: false })
      localStorage.removeItem(`${STORAGE_KEY}_clawnews`)
    }, []),
  }

  return (
    <AgentSkillMoltbookContext.Provider value={moltbookValue}>
      <AgentSkillClawnewsContext.Provider value={clawnewsValue}>
        {children}
      </AgentSkillClawnewsContext.Provider>
    </AgentSkillMoltbookContext.Provider>
  )
}

export function useAgentSkill(platform: 'moltbook' | 'clawnews') {
  const moltbook = useContext(AgentSkillMoltbookContext)
  const clawnews = useContext(AgentSkillClawnewsContext)
  const value = platform === 'moltbook' ? moltbook : clawnews
  if (!value) {
    throw new Error(
      `useAgentSkill must be used within AgentSkillProvider for platform: ${platform}`
    )
  }
  return value
}
