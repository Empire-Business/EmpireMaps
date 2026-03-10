import { useCallback } from 'react'

const STORAGE_KEY = 'empire_recent_formats'
const MAX_RECENT = 6

export function useRecentFormats() {
  function getRecent(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }

  const trackView = useCallback((formatId: string) => {
    const recent = getRecent().filter((id) => id !== formatId)
    const updated = [formatId, ...recent].slice(0, MAX_RECENT)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // storage might be unavailable
    }
  }, [])

  return { getRecent, trackView }
}
