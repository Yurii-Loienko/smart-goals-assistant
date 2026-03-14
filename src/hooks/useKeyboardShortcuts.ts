import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const isInputFocused = () => {
      const el = document.activeElement
      return el instanceof HTMLInputElement || 
             el instanceof HTMLTextAreaElement ||
             el?.getAttribute('contenteditable') === 'true'
    }

    const handler = (e: KeyboardEvent) => {
      if (isInputFocused()) return

      const isDashboard = location.pathname === '/dashboard'

      if (e.key === 'n' && isDashboard) {
        e.preventDefault()
        navigate('/goals/new')
      }

      if (e.key === '/' && isDashboard) {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search goals..."]')
        searchInput?.focus()
      }

      if (e.key === 'Escape') {
        const activeEl = document.activeElement as HTMLElement
        activeEl?.blur()
      }

      if (e.key === 'Backspace' && !isDashboard && location.pathname !== '/') {
        e.preventDefault()
        navigate(-1)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, location.pathname])
}

export const shortcutsList = [
  { keys: 'N', description: 'New goal (from dashboard)' },
  { keys: '/', description: 'Focus search (from dashboard)' },
  { keys: 'Esc', description: 'Unfocus current element' },
  { keys: '⌫', description: 'Go back' },
]
