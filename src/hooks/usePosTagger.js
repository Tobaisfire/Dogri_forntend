import { useEffect, useState } from 'react'
import { API_BASE, DEFAULT_POS_MODELS } from '../config'

export function useModelList() {
  const [models, setModels] = useState({ base: [], hybrid: [] })
  const [metrics, setMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE}/models`)
        if (!response.ok) throw new Error('Failed to load models')
        const data = await response.json()
        setModels(data)
        if (data.metrics) {
          setMetrics(data.metrics)
        } else {
          // fetch metrics explicitly if not present
          const metricsResponse = await fetch(`${API_BASE}/models?include_metrics=true`)
          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json()
            setMetrics(metricsData.metrics || {})
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load models')
      } finally {
        setIsLoading(false)
      }
    }
    fetchModels()
  }, [])

  return { models, metrics, isLoading, error }
}

export function usePosTagger() {
  const [sentence, setSentence] = useState('')
  const [selectedModels, setSelectedModels] = useState(DEFAULT_POS_MODELS)
  const [tokens, setTokens] = useState([])
  const [results, setResults] = useState({})
  const [timings, setTimings] = useState({})
  const [agreements, setAgreements] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileResult, setFileResult] = useState(null)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [fileError, setFileError] = useState(null)

  const runInference = async () => {
    if (!sentence.trim()) {
      setError('Please enter a sentence first.')
      return
    }
    if (!selectedModels.length) {
      setError('Please select at least one model.')
      return
    }
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, models: selectedModels })
      })
      if (!response.ok) throw new Error('Failed to run POS tagging.')
      const data = await response.json()
      setTokens(data.tokens || [])
      setResults(data.results || {})
      setTimings(data.timings || {})
      setAgreements(data.agreements || {})
    } catch (err) {
      setError(err.message || 'Failed to run POS tagging.')
    } finally {
      setIsLoading(false)
    }
  }

  const runFileInference = async (file) => {
    if (!file) {
      setFileError('Please upload a .txt file first.')
      return
    }
    if (!selectedModels.length) {
      setFileError('Select at least one model before tagging the file.')
      return
    }
    try {
      setFileError(null)
      setFileResult(null)
      setIsFileLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('models', JSON.stringify(selectedModels))
      const response = await fetch(`${API_BASE}/predict/file`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Failed to tag the uploaded file.')
      const data = await response.json()
      setFileResult(data)
    } catch (err) {
      setFileResult(null)
      setFileError(err.message || 'Failed to tag the uploaded file.')
    } finally {
      setIsFileLoading(false)
    }
  }

  const resetFileWorkflow = () => {
    setFileError(null)
    setFileResult(null)
  }

  return {
    sentence,
    setSentence,
    selectedModels,
    setSelectedModels,
    tokens,
    results,
    timings,
    agreements,
    isLoading,
    error,
    runInference,
    fileResult,
    isFileLoading,
    fileError,
    runFileInference,
    resetFileWorkflow,
  }
}


