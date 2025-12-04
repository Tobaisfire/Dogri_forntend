import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../config'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  const [ambiguitySummary, setAmbiguitySummary] = useState(null)
  const [ambiguityExamples, setAmbiguityExamples] = useState(null)
  const [ambiguityLoading, setAmbiguityLoading] = useState(true)
  const [ambiguityError, setAmbiguityError] = useState(null)

  const loadAnalytics = useCallback(async (forceReload = false) => {
    try {
      setAnalyticsError(null)
      setAnalyticsLoading(true)
      const url = `${API_BASE}/analytics${forceReload ? '?force_reload=true' : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load analytics.')
      setAnalytics(await response.json())
    } catch (err) {
      setAnalytics(null)
      setAnalyticsError(err.message || 'Unable to load analytics.')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const loadAmbiguity = useCallback(async (forceReload = false) => {
    try {
      setAmbiguityError(null)
      setAmbiguityLoading(true)
      const [summaryRes, examplesRes] = await Promise.all([
        fetch(`${API_BASE}/ambiguity/summary${forceReload ? '?force_reload=true' : ''}`),
        fetch(`${API_BASE}/ambiguity/examples?limit=6${forceReload ? '&force_reload=true' : ''}`),
      ])
      if (!summaryRes.ok) throw new Error('Failed to load ambiguity summary.')
      if (!examplesRes.ok) throw new Error('Failed to load ambiguity examples.')
      setAmbiguitySummary(await summaryRes.json())
      setAmbiguityExamples(await examplesRes.json())
    } catch (err) {
      setAmbiguitySummary(null)
      setAmbiguityExamples(null)
      setAmbiguityError(err.message || 'Unable to load ambiguity analytics.')
    } finally {
      setAmbiguityLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
    loadAmbiguity()
  }, [loadAnalytics, loadAmbiguity])

  const value = {
    analytics,
    analyticsLoading,
    analyticsError,
    reloadAnalytics: () => loadAnalytics(true),
    setAnalyticsFromUpload: setAnalytics,
    ambiguitySummary,
    ambiguityExamples,
    ambiguityLoading,
    ambiguityError,
    reloadAmbiguity: () => loadAmbiguity(true),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useDataContext() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return ctx
}


