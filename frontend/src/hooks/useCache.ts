/**
 * Simple in-memory cache with SWR-like behavior
 * Returns cached data while fetching fresh data in background
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

const DEFAULT_STALE_MS = 30_000 // 30 seconds

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleMs: number = DEFAULT_STALE_MS
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const isFresh = useRef(false)

  const fetch = useCallback(async () => {
    const now = Date.now()
    const cached = memoryCache.get(key) as CacheEntry<T> | undefined
    
    // Return cached data immediately if fresh
    if (cached && now - cached.timestamp < staleMs) {
      setData(cached.data)
      setLoading(false)
      isFresh.current = true
      return cached.data
    }
    
    // Fetch fresh data (background)
    isFresh.current = false
    try {
      const fresh = await fetcher()
      memoryCache.set(key, { data: fresh, timestamp: now })
      setData(fresh)
      setLoading(false)
      setError('')
      return fresh
    } catch (err) {
      // If we have cached data, show it with error
      if (cached) {
        setData(cached.data)
        setError('Datos desactualizados. Error al actualizar.')
      } else {
        setError('Error al cargar los datos.')
      }
      setLoading(false)
      throw err
    }
  }, [key, fetcher, staleMs])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    data,
    loading,
    error,
    refetch: fetch,
    isFresh: isFresh.current,
  }
}

/**
 * Clear cache entry
 */
export function clearCache(key?: string) {
  if (key) {
    memoryCache.delete(key)
  } else {
    memoryCache.clear()
  }
}