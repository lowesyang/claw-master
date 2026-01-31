import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { ClawNewsAgent, ClawNewsCredentials, SavedAgent } from '../types'
import { getMyProfile, getAuthStatus } from '../services/clawnews'

interface ClawNewsContextType {
  apiKey: string
  agentInfo: ClawNewsAgent | null
  credentials: ClawNewsCredentials | null
  isLoggedIn: boolean
  authStatus: { claimed: boolean; verified: boolean } | null
  // Multi-agent support
  savedAgents: SavedAgent[]
  currentAgentId: string | null
  login: (key: string) => Promise<void>
  logout: () => void
  saveCredentials: (creds: ClawNewsCredentials) => void
  refreshAgentInfo: () => Promise<void>
  // Multi-agent methods
  addAgent: (apiKey: string, name?: string) => Promise<SavedAgent>
  removeAgent: (agentId: string) => void
  switchAgent: (agentId: string) => Promise<void>
  updateAgentName: (agentId: string, name: string) => void
}

const ClawNewsContext = createContext<ClawNewsContextType | undefined>(undefined)

const STORAGE_KEY_API = 'clawnews_api_key'
const STORAGE_KEY_AGENT = 'clawnews_agent_info'
const STORAGE_KEY_CREDS = 'clawnews_credentials'
const STORAGE_KEY_SAVED_AGENTS = 'clawnews_saved_agents'
const STORAGE_KEY_CURRENT_AGENT_ID = 'clawnews_current_agent_id'

export function ClawNewsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY_API) || '')
  const [agentInfo, setAgentInfo] = useState<ClawNewsAgent | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_AGENT)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [credentials, setCredentials] = useState<ClawNewsCredentials | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CREDS)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [authStatus, setAuthStatus] = useState<{ claimed: boolean; verified: boolean } | null>(null)

  // Multi-agent state
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_SAVED_AGENTS)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_CURRENT_AGENT_ID) || null
  )

  const saveAgentInfo = useCallback((info: ClawNewsAgent) => {
    setAgentInfo(info)
    localStorage.setItem(STORAGE_KEY_AGENT, JSON.stringify(info))
  }, [])

  const saveCredentials = useCallback((creds: ClawNewsCredentials) => {
    setCredentials(creds)
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(creds))
  }, [])

  const loadAgentInfo = useCallback(async () => {
    if (!apiKey) return

    try {
      const agent = await getMyProfile(apiKey)
      saveAgentInfo(agent)

      const status = await getAuthStatus(apiKey)
      setAuthStatus({ claimed: status.claimed, verified: status.verified })

      // 如果 API 返回了 claim_url，保存到 credentials 中
      if (status.claim_url && !credentials?.claim_url) {
        saveCredentials({
          ...credentials,
          agent_id: credentials?.agent_id || '',
          api_key: apiKey,
          claim_url: status.claim_url,
          claim_code: credentials?.claim_code || '',
        })
      }
    } catch (error) {
      console.error('Failed to load ClawNews agent info:', error)
      // Keep existing info on error
    }
  }, [apiKey, saveAgentInfo, credentials, saveCredentials])

  const login = async (key: string) => {
    // Verify the key by fetching profile
    const agent = await getMyProfile(key)
    setApiKey(key)
    localStorage.setItem(STORAGE_KEY_API, key)
    saveAgentInfo(agent)

    const status = await getAuthStatus(key)
    setAuthStatus({ claimed: status.claimed, verified: status.verified })

    // 如果 API 返回了 claim_url，保存到 credentials 中
    if (status.claim_url) {
      saveCredentials({
        agent_id: '',
        api_key: key,
        claim_url: status.claim_url,
        claim_code: '',
      })
    }
  }

  const logout = useCallback(() => {
    setApiKey('')
    setAgentInfo(null)
    setAuthStatus(null)
    setCurrentAgentId(null)
    localStorage.removeItem(STORAGE_KEY_API)
    localStorage.removeItem(STORAGE_KEY_AGENT)
    localStorage.removeItem(STORAGE_KEY_CURRENT_AGENT_ID)
  }, [])

  // Multi-agent methods
  const saveSavedAgents = useCallback((agents: SavedAgent[]) => {
    setSavedAgents(agents)
    localStorage.setItem(STORAGE_KEY_SAVED_AGENTS, JSON.stringify(agents))
  }, [])

  const addAgent = useCallback(async (apiKey: string, customName?: string): Promise<SavedAgent> => {
    // Verify the key and get agent info
    const agent = await getMyProfile(apiKey)

    // Check if agent already exists
    const existingIndex = savedAgents.findIndex(a => a.apiKey === apiKey)
    if (existingIndex >= 0) {
      // Update existing agent
      const updated = [...savedAgents]
      updated[existingIndex] = {
        ...updated[existingIndex],
        name: customName || agent.handle || updated[existingIndex].name,
        handle: agent.handle,
        lastUsedAt: new Date().toISOString(),
      }
      saveSavedAgents(updated)
      return updated[existingIndex]
    }

    // Create new saved agent
    const newAgent: SavedAgent = {
      id: `clawnews_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiKey,
      name: customName || agent.handle || 'Unnamed Agent',
      handle: agent.handle,
      platform: 'clawnews',
      addedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    }

    saveSavedAgents([...savedAgents, newAgent])
    return newAgent
  }, [savedAgents, saveSavedAgents])

  const removeAgent = useCallback((agentId: string) => {
    const updated = savedAgents.filter(a => a.id !== agentId)
    saveSavedAgents(updated)

    // If removing current agent, logout
    if (currentAgentId === agentId) {
      logout()
    }
  }, [savedAgents, saveSavedAgents, currentAgentId, logout])

  const switchAgent = useCallback(async (agentId: string) => {
    const agent = savedAgents.find(a => a.id === agentId)
    if (!agent) {
      throw new Error('Agent not found')
    }

    // Login with the agent's API key
    await login(agent.apiKey)

    // Update current agent ID and last used time
    setCurrentAgentId(agentId)
    localStorage.setItem(STORAGE_KEY_CURRENT_AGENT_ID, agentId)

    const updated = savedAgents.map(a =>
      a.id === agentId
        ? { ...a, lastUsedAt: new Date().toISOString() }
        : a
    )
    saveSavedAgents(updated)
  }, [savedAgents, saveSavedAgents])

  const updateAgentName = useCallback((agentId: string, name: string) => {
    const updated = savedAgents.map(a =>
      a.id === agentId ? { ...a, name } : a
    )
    saveSavedAgents(updated)
  }, [savedAgents, saveSavedAgents])

  useEffect(() => {
    if (apiKey) {
      loadAgentInfo()
    }
  }, [apiKey, loadAgentInfo])

  return (
    <ClawNewsContext.Provider
      value={{
        apiKey,
        agentInfo,
        credentials,
        isLoggedIn: !!apiKey,
        authStatus,
        // Multi-agent support
        savedAgents,
        currentAgentId,
        login,
        logout,
        saveCredentials,
        refreshAgentInfo: loadAgentInfo,
        // Multi-agent methods
        addAgent,
        removeAgent,
        switchAgent,
        updateAgentName,
      }}
    >
      {children}
    </ClawNewsContext.Provider>
  )
}

export function useClawNews() {
  const context = useContext(ClawNewsContext)
  if (context === undefined) {
    throw new Error('useClawNews must be used within a ClawNewsProvider')
  }
  return context
}
