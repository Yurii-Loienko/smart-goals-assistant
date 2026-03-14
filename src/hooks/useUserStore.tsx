import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react'
import { UserProfile, Goal, YearWorkspace, ExportData } from '@/types'
import { YEAR_RANGE_START, YEAR_RANGE_END, YEAR_SCAN_START, YEAR_SCAN_END } from '@/lib/constants'
import { generateId } from '@/lib/utils'

const USERS_INDEX_KEY = 'smart-goals-users'
const CURRENT_USER_KEY = 'smart-goals-current-user'
const CURRENT_YEAR_KEY = 'smart-goals-current-year'

function profileKey(userId: string) {
  return `smart-goals-${userId}-profile`
}

function goalsKey(userId: string, year: number) {
  return `smart-goals-${userId}-${year}-goals`
}

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function getAllUserIds(): string[] {
  return safeLoad<string[]>(USERS_INDEX_KEY, [])
}

function saveUsersIndex(ids: string[]) {
  localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(ids))
}

function deduplicateUsers() {
  const ids = getAllUserIds()
  const seen = new Map<string, string>()
  const uniqueIds: string[] = []

  for (const id of ids) {
    const user = safeLoad<UserProfile | null>(profileKey(id), null)
    if (!user) {
      localStorage.removeItem(profileKey(id))
      continue
    }

    const key = user.email || user.name || id
    if (seen.has(key)) {
      const keepId = seen.get(key)!
      for (let y = YEAR_RANGE_START; y <= YEAR_RANGE_END; y++) {
        const dupeGoals = safeLoad<Goal[]>(goalsKey(id, y), [])
        if (dupeGoals.length > 0) {
          const existingGoals = safeLoad<Goal[]>(goalsKey(keepId, y), [])
          const existingIds = new Set(existingGoals.map(g => g.id))
          const merged = [...existingGoals, ...dupeGoals.filter(g => !existingIds.has(g.id))]
          localStorage.setItem(goalsKey(keepId, y), JSON.stringify(merged))
        }
        localStorage.removeItem(goalsKey(id, y))
      }
      localStorage.removeItem(profileKey(id))
    } else {
      seen.set(key, id)
      uniqueIds.push(id)
    }
  }

  if (uniqueIds.length !== ids.length) {
    saveUsersIndex(uniqueIds)
  }
}

interface UserStoreValue {
  currentUserId: string | null
  currentYear: number
  profile: UserProfile | null
  goals: Goal[]
  allUsers: UserProfile[]
  setCurrentUserId: (id: string | null) => void
  setCurrentYear: (year: number) => void
  saveProfile: (p: UserProfile) => void
  createUser: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => UserProfile
  deleteUser: (userId: string) => void
  addGoal: (goal: Goal) => void
  addGoals: (goals: Goal[]) => void
  replaceGoals: (goals: Goal[], year?: number) => void
  clearAllGoals: () => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  getGoal: (id: string) => Goal | null
  getYearsWithData: () => number[]
  getGoalsForYear: (year: number) => Goal[]
  exportUserData: () => ExportData | null
  importUserData: (data: ExportData) => UserProfile
}

const UserStoreContext = createContext<UserStoreValue | null>(null)

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const store = useUserStoreInternal()
  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  )
}

export function useUserStore(): UserStoreValue {
  const ctx = useContext(UserStoreContext)
  if (!ctx) throw new Error('useUserStore must be used within UserStoreProvider')
  return ctx
}

deduplicateUsers()

function useUserStoreInternal(): UserStoreValue {
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(
    () => localStorage.getItem(CURRENT_USER_KEY)
  )
  const [currentYear, setCurrentYearState] = useState<number>(
    () => {
      const stored = localStorage.getItem(CURRENT_YEAR_KEY)
      return stored ? parseInt(stored) : new Date().getFullYear()
    }
  )
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const userId = localStorage.getItem(CURRENT_USER_KEY)
    return userId ? safeLoad<UserProfile | null>(profileKey(userId), null) : null
  })
  const [goals, setGoalsState] = useState<Goal[]>(() => {
    const userId = localStorage.getItem(CURRENT_USER_KEY)
    const stored = localStorage.getItem(CURRENT_YEAR_KEY)
    const year = stored ? parseInt(stored) : new Date().getFullYear()
    return userId ? safeLoad<Goal[]>(goalsKey(userId, year), []) : []
  })
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const ids = getAllUserIds()
    return ids.map((id) => safeLoad<UserProfile | null>(profileKey(id), null)).filter(Boolean) as UserProfile[]
  })

  const loadProfile = useCallback((userId: string): UserProfile | null => {
    return safeLoad<UserProfile | null>(profileKey(userId), null)
  }, [])

  const loadGoals = useCallback((userId: string, year: number): Goal[] => {
    return safeLoad<Goal[]>(goalsKey(userId, year), [])
  }, [])

  const refreshAllUsers = useCallback(() => {
    const ids = getAllUserIds()
    const users = ids.map((id) => safeLoad<UserProfile | null>(profileKey(id), null)).filter(Boolean) as UserProfile[]
    setAllUsers(users)
  }, [])

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(CURRENT_USER_KEY, currentUserId)
      const p = loadProfile(currentUserId)
      setProfileState(p)
      setGoalsState(loadGoals(currentUserId, currentYear))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
      setProfileState(null)
      setGoalsState([])
    }
  }, [currentUserId, currentYear, loadProfile, loadGoals])

  useEffect(() => {
    localStorage.setItem(CURRENT_YEAR_KEY, String(currentYear))
  }, [currentYear])

  const setCurrentUserId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(CURRENT_USER_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
    setCurrentUserIdState(id)
  }, [])

  const setCurrentYear = useCallback((year: number) => {
    localStorage.setItem(CURRENT_YEAR_KEY, String(year))
    setCurrentYearState(year)
  }, [])

  const saveProfile = useCallback((p: UserProfile) => {
    localStorage.setItem(profileKey(p.id), JSON.stringify(p))
    const ids = getAllUserIds()
    if (!ids.includes(p.id)) {
      saveUsersIndex([...ids, p.id])
    }
    setProfileState(p)
    refreshAllUsers()
  }, [refreshAllUsers])

  const createUser = useCallback((data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile => {
    if (data.email) {
      const ids = getAllUserIds()
      for (const id of ids) {
        const existing = safeLoad<UserProfile | null>(profileKey(id), null)
        if (existing && existing.email === data.email) {
          const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
          localStorage.setItem(profileKey(existing.id), JSON.stringify(updated))
          localStorage.setItem(CURRENT_USER_KEY, existing.id)
          setProfileState(updated)
          setCurrentUserIdState(existing.id)
          refreshAllUsers()
          return updated
        }
      }
    }

    const now = new Date().toISOString()
    const user: UserProfile = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    localStorage.setItem(profileKey(user.id), JSON.stringify(user))
    const ids = getAllUserIds()
    if (!ids.includes(user.id)) {
      saveUsersIndex([...ids, user.id])
    }
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    setProfileState(user)
    setCurrentUserIdState(user.id)
    refreshAllUsers()
    return user
  }, [refreshAllUsers])

  const deleteUser = useCallback((userId: string) => {
    const ids = getAllUserIds()
    saveUsersIndex(ids.filter((id) => id !== userId))
    localStorage.removeItem(profileKey(userId))
    for (let y = YEAR_RANGE_START; y <= YEAR_RANGE_END; y++) {
      localStorage.removeItem(goalsKey(userId, y))
    }
    if (currentUserId === userId) {
      localStorage.removeItem(CURRENT_USER_KEY)
      setCurrentUserIdState(null)
      setProfileState(null)
      setGoalsState([])
    }
    refreshAllUsers()
  }, [currentUserId, refreshAllUsers])

  const persistGoals = useCallback((userId: string, year: number, newGoals: Goal[]) => {
    localStorage.setItem(goalsKey(userId, year), JSON.stringify(newGoals))
    if (userId === currentUserId && year === currentYear) {
      setGoalsState(newGoals)
    }
  }, [currentUserId, currentYear])

  const addGoal = useCallback((goal: Goal) => {
    if (!currentUserId) return
    const current = loadGoals(currentUserId, currentYear)
    persistGoals(currentUserId, currentYear, [...current, goal])
  }, [currentUserId, currentYear, loadGoals, persistGoals])

  const addGoals = useCallback((newGoals: Goal[]) => {
    if (!currentUserId) return
    const current = loadGoals(currentUserId, currentYear)
    persistGoals(currentUserId, currentYear, [...current, ...newGoals])
  }, [currentUserId, currentYear, loadGoals, persistGoals])

  const replaceGoals = useCallback((newGoals: Goal[], year?: number) => {
    if (!currentUserId) return
    const targetYear = year ?? currentYear
    persistGoals(currentUserId, targetYear, newGoals)
    if (year && year !== currentYear) {
      setCurrentYear(year)
    }
  }, [currentUserId, currentYear, persistGoals, setCurrentYear])

  const clearAllGoals = useCallback(() => {
    if (!currentUserId) return
    for (let y = YEAR_RANGE_START; y <= YEAR_RANGE_END; y++) {
      localStorage.removeItem(goalsKey(currentUserId, y))
    }
    setGoalsState([])
  }, [currentUserId])

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    if (!currentUserId) return
    const current = loadGoals(currentUserId, currentYear)
    const updated = current.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    )
    persistGoals(currentUserId, currentYear, updated)
  }, [currentUserId, currentYear, loadGoals, persistGoals])

  const deleteGoal = useCallback((id: string) => {
    if (!currentUserId) return
    const current = loadGoals(currentUserId, currentYear)
    persistGoals(currentUserId, currentYear, current.filter((g) => g.id !== id))
  }, [currentUserId, currentYear, loadGoals, persistGoals])

  const getGoal = useCallback(
    (id: string) => goals.find((g) => g.id === id) || null,
    [goals]
  )

  const getYearsWithData = useCallback((): number[] => {
    if (!currentUserId) return []
    const years: number[] = []
    for (let y = YEAR_SCAN_START; y <= YEAR_SCAN_END; y++) {
      const data = safeLoad<Goal[]>(goalsKey(currentUserId, y), [])
      if (data.length > 0) years.push(y)
    }
    if (!years.includes(currentYear)) years.push(currentYear)
    return years.sort()
  }, [currentUserId, currentYear])

  const getGoalsForYear = useCallback((year: number): Goal[] => {
    if (!currentUserId) return []
    return loadGoals(currentUserId, year)
  }, [currentUserId, loadGoals])

  const exportUserData = useCallback((): ExportData | null => {
    if (!currentUserId || !profile) return null
    const years = getYearsWithData()
    const workspaces: YearWorkspace[] = years.map((y) => ({
      year: y,
      goals: loadGoals(currentUserId, y),
      createdAt: new Date().toISOString(),
    }))
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      workspaces,
    }
  }, [currentUserId, profile, getYearsWithData, loadGoals])

  const importUserData = useCallback((data: ExportData): UserProfile => {
    const imported = { ...data.profile, id: generateId(), updatedAt: new Date().toISOString() }
    localStorage.setItem(profileKey(imported.id), JSON.stringify(imported))
    const ids = getAllUserIds()
    if (!ids.includes(imported.id)) {
      saveUsersIndex([...ids, imported.id])
    }
    for (const ws of data.workspaces) {
      localStorage.setItem(goalsKey(imported.id, ws.year), JSON.stringify(ws.goals))
    }
    localStorage.setItem(CURRENT_USER_KEY, imported.id)
    setProfileState(imported)
    setCurrentUserIdState(imported.id)
    refreshAllUsers()
    return imported
  }, [refreshAllUsers])

  return {
    currentUserId,
    currentYear,
    profile,
    goals,
    allUsers,
    setCurrentUserId,
    setCurrentYear,
    saveProfile,
    createUser,
    deleteUser,
    addGoal,
    addGoals,
    replaceGoals,
    clearAllGoals,
    updateGoal,
    deleteGoal,
    getGoal,
    getYearsWithData,
    getGoalsForYear,
    exportUserData,
    importUserData,
  }
}
