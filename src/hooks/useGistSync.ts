import { useState, useCallback } from 'react'
import { useUserStore } from './useUserStore'
import { createGist, updateGist, fetchGist, validateToken } from '@/lib/gistSync'

const TOKEN_KEY = 'smart-goals-gh-token'
const GIST_ID_KEY = 'smart-goals-gist-id'
const LAST_SYNC_KEY = 'smart-goals-last-sync'

function getStored(key: string): string | null {
  return localStorage.getItem(key)
}

export function useGistSync() {
  const { exportUserData, importUserData, currentUserId } = useUserStore()

  const [token, setTokenState] = useState<string | null>(() => getStored(TOKEN_KEY))
  const [gistId, setGistIdState] = useState<string | null>(() => getStored(GIST_ID_KEY))
  const [lastSync, setLastSyncState] = useState<string | null>(() => getStored(LAST_SYNC_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = Boolean(token)

  const saveToken = useCallback(async (newToken: string) => {
    setError(null)
    setLoading(true)
    try {
      const login = await validateToken(newToken)
      localStorage.setItem(TOKEN_KEY, newToken)
      setTokenState(newToken)
      setLoading(false)
      return login
    } catch (err) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : 'Failed to validate token'
      setError(msg)
      throw err
    }
  }, [])

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(GIST_ID_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
    setTokenState(null)
    setGistIdState(null)
    setLastSyncState(null)
    setError(null)
  }, [])

  const push = useCallback(async () => {
    if (!token || !currentUserId) return
    setError(null)
    setLoading(true)
    try {
      const data = exportUserData()
      if (!data) throw new Error('No data to push')

      if (gistId) {
        await updateGist(token, gistId, data)
      } else {
        const newId = await createGist(token, data)
        localStorage.setItem(GIST_ID_KEY, newId)
        setGistIdState(newId)
      }

      const now = new Date().toISOString()
      localStorage.setItem(LAST_SYNC_KEY, now)
      setLastSyncState(now)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : 'Push failed'
      setError(msg)
      throw err
    }
  }, [token, gistId, currentUserId, exportUserData])

  const pull = useCallback(async () => {
    if (!token || !gistId) return
    setError(null)
    setLoading(true)
    try {
      const { data, updatedAt } = await fetchGist(token, gistId)
      importUserData(data)
      localStorage.setItem(LAST_SYNC_KEY, updatedAt)
      setLastSyncState(updatedAt)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : 'Pull failed'
      setError(msg)
      throw err
    }
  }, [token, gistId, importUserData])

  const setGistId = useCallback((id: string) => {
    localStorage.setItem(GIST_ID_KEY, id)
    setGistIdState(id)
  }, [])

  return {
    token,
    gistId,
    lastSync,
    loading,
    error,
    isConfigured,
    saveToken,
    clearToken,
    push,
    pull,
    setGistId,
  }
}
