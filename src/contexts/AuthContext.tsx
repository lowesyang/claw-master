import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { Agent, SavedAgent } from '../types'
import { apiRequest } from '../services/api'

interface AuthContextType {
  apiKey: string
  agentInfo: Agent | null
  openrouterApiKey: string
  aiModel: string
  isLoggedIn: boolean
  // Multi-agent support
  savedAgents: SavedAgent[]
  currentAgentId: string | null
  login: (key: string) => Promise<void>
  logout: () => void
  setOpenRouterSettings: (key: string, model: string) => void
  refreshAgentInfo: () => Promise<void>
  // Multi-agent methods
  addAgent: (apiKey: string, name?: string) => Promise<SavedAgent>
  removeAgent: (agentId: string) => void
  switchAgent: (agentId: string) => Promise<void>
  updateAgentName: (agentId: string, name: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY_SAVED_AGENTS = 'moltbook_saved_agents'
const STORAGE_KEY_CURRENT_AGENT_ID = 'moltbook_current_agent_id'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('moltbook_api_key') || '')
  const [agentInfo, setAgentInfo] = useState<Agent | null>(() => {
    try {
      const cached = localStorage.getItem('moltbook_agent_info')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [openrouterApiKey, setOpenrouterApiKey] = useState(
    () => localStorage.getItem('openrouter_api_key') || ''
  )
  const [aiModel, setAiModel] = useState(
    () => localStorage.getItem('openrouter_model') || 'anthropic/claude-sonnet-4.5'
  )

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

  // Use ref to access latest agentInfo without adding it to dependencies
  const agentInfoRef = useRef(agentInfo)
  agentInfoRef.current = agentInfo

  const saveAgentInfo = useCallback((info: Agent) => {
    setAgentInfo(info)
    localStorage.setItem('moltbook_agent_info', JSON.stringify(info))
  }, [])

  const logout = useCallback(() => {
    setApiKey('')
    setAgentInfo(null)
    setCurrentAgentId(null)
    localStorage.removeItem('moltbook_api_key')
    localStorage.removeItem('moltbook_agent_info')
    localStorage.removeItem(STORAGE_KEY_CURRENT_AGENT_ID)
  }, [])

  // Multi-agent methods
  const saveSavedAgents = useCallback((agents: SavedAgent[]) => {
    setSavedAgents(agents)
    localStorage.setItem(STORAGE_KEY_SAVED_AGENTS, JSON.stringify(agents))
  }, [])

  const addAgent = useCallback(async (key: string, customName?: string): Promise<SavedAgent> => {
    // Verify the key and get agent info
    const data = await apiRequest<{ agent?: Agent }>('/agents/me', {}, key)
    const agent = data.agent || (data as unknown as Agent)

    // Check if agent already exists
    const existingIndex = savedAgents.findIndex(a => a.apiKey === key)
    if (existingIndex >= 0) {
      // Update existing agent
      const updated = [...savedAgents]
      updated[existingIndex] = {
        ...updated[existingIndex],
        name: customName || agent.name || updated[existingIndex].name,
        description: agent.description,
        lastUsedAt: new Date().toISOString(),
      }
      saveSavedAgents(updated)
      return updated[existingIndex]
    }

    // Create new saved agent
    const newAgent: SavedAgent = {
      id: `moltbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiKey: key,
      name: customName || agent.name || 'Unnamed Agent',
      description: agent.description,
      platform: 'moltbook',
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

  const loadAgentInfo = useCallback(async () => {
    if (!apiKey) return

    try {
      const data = await apiRequest<{ agent?: Agent }>('/agents/me', {}, apiKey)
      const agent = data.agent || (data as unknown as Agent)
      saveAgentInfo(agent)
    } catch (error) {
      const err = error as { message?: string; hint?: string; apiResponse?: { status?: number } }

      // Handle "not yet claimed" error - keep the user logged in
      if (err.message?.includes('not yet claimed')) {
        let claimUrl: string | undefined
        if (err.hint) {
          const urlMatch = err.hint.match(/https:\/\/[^\s]+/)
          if (urlMatch) claimUrl = urlMatch[0]
        }

        const currentInfo = agentInfoRef.current
        const unclaimed: Agent = {
          name: currentInfo?.name || 'Agent',
          is_claimed: false,
          karma: 0,
          claim_url: claimUrl || currentInfo?.claim_url,
        }
        saveAgentInfo(unclaimed)
      }
      // Only logout on explicit authentication errors (invalid API key)
      else if (err.message?.includes('Invalid') || err.message?.includes('Unauthorized') || err.message?.includes('invalid')) {
        logout()
      }
      // For network errors or other issues, just log and keep the cached data
      else {
        console.warn('Failed to refresh agent info:', err.message)
        // Keep using cached data, don't logout
      }
    }
  }, [apiKey, saveAgentInfo, logout])

  const login = async (key: string) => {
    await apiRequest('/agents/me', {}, key)
    setApiKey(key)
    localStorage.setItem('moltbook_api_key', key)
  }

  const setOpenRouterSettings = (key: string, model: string) => {
    setOpenrouterApiKey(key)
    setAiModel(model)
    localStorage.setItem('openrouter_api_key', key)
    localStorage.setItem('openrouter_model', model)
  }

  useEffect(() => {
    if (apiKey) {
      loadAgentInfo()
    }
  }, [apiKey, loadAgentInfo])

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        agentInfo,
        openrouterApiKey,
        aiModel,
        isLoggedIn: !!apiKey,
        // Multi-agent support
        savedAgents,
        currentAgentId,
        login,
        logout,
        setOpenRouterSettings,
        refreshAgentInfo: loadAgentInfo,
        // Multi-agent methods
        addAgent,
        removeAgent,
        switchAgent,
        updateAgentName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
