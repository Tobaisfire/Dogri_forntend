import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../config'

const REQUIRED_COLUMNS_FALLBACK = [
  'file_id',
  'category',
  'Sub-category',
  'address',
  'sentence_index',
  'Sentences',
  'token_index',
  'token',
  'Tagg',
  'confidence',
  'explanation',
]

const numberFormat = new Intl.NumberFormat('en-IN')

const formatNumber = (value) => {
  if (value == null || Number.isNaN(value)) return '—'
  return numberFormat.format(value)
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [lastUploadedName, setLastUploadedName] = useState(null)

  const fetchAnalytics = async (forceReload = false) => {
    try {
      setError(null)
      setLoading(true)
      const url = `${API_BASE}/analytics${forceReload ? '?force_reload=true' : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load analytics.')
      const data = await response.json()
      setAnalytics(data)
      setLastUploadedName(null)
    } catch (err) {
      setAnalytics(null)
      setError(err.message || 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''
    try {
      setUploadError(null)
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${API_BASE}/analytics/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to parse uploaded file.')
      }
      const data = await response.json()
      setAnalytics(data)
      setLastUploadedName(file.name)
    } catch (err) {
      setUploadError(err.message || 'Failed to upload analytics file.')
    } finally {
      setUploading(false)
    }
  }

  const requiredColumns = analytics?.required_columns ?? REQUIRED_COLUMNS_FALLBACK

  const summaryCards = useMemo(() => {
    if (!analytics) return []
    return [
      { label: 'Total Sentences', value: analytics.total_sentences },
      { label: 'Total Tokens', value: analytics.total_tokens },
      { label: 'Categories', value: analytics.unique_categories },
      { label: 'Sub-Categories', value: analytics.unique_sub_categories },
    ]
  }, [analytics])

  const renderChartSection = (title, data, emptyState) => (
    <section className="manual-card analytics-card" key={title}>
      <div className="analytics-card-header">
        <h3>{title}</h3>
        <span className="muted">{data?.length ? `${data.length} entries` : ''}</span>
      </div>
      {!data?.length ? (
        <p className="muted">{emptyState}</p>
      ) : (
        <div className="chart-stack">
          {(() => {
            const max = Math.max(...data.map((item) => item.value))
            return data.map((item) => (
              <div key={item.label} className="chart-row">
                <div className="chart-label">
                  <strong>{item.label}</strong>
                  <small>
                    {formatNumber(item.value)} {item.percentage != null ? `(${item.percentage}%)` : ''}
                  </small>
                </div>
                <div className="chart-bar">
                  <span style={{ width: max ? `${(item.value / max) * 100}%` : '0%' }} />
                </div>
              </div>
            ))
          })()}
        </div>
      )}
    </section>
  )

  return (
    <div className="analytics-panel">
      <header className="manual-header">
        <div>
          <h1>Data Analytics</h1>
          <p className="muted">
            Insights generated from <code>Final_pos_tagged_200k(no error).xlsx</code> with on-demand uploads.
          </p>
        </div>
        <div className="analytics-actions">
          <button className="ghost" onClick={() => fetchAnalytics(true)} disabled={loading}>
            Refresh Default
          </button>
          <label className="file-input-wrapper compact">
            <span>{uploading ? 'Processing...' : 'Upload Excel'}</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {uploadError && <div className="error-banner">{uploadError}</div>}

      {analytics && (
        <>
          <section className="manual-card">
            <div className="analytics-meta">
              <div>
                <h2>Dataset</h2>
                <p className="muted">
                  Source: <strong>{analytics.source === 'default' ? 'Default corpus' : 'Uploaded file'}</strong>
                  {analytics.file_name ? ` • ${analytics.file_name}` : ''}
                  {analytics.sheet_name ? ` • Sheet: ${analytics.sheet_name}` : ''}
                </p>
                {analytics.generated_at && (
                  <p className="muted">Generated at: {new Date(analytics.generated_at).toLocaleString()}</p>
                )}
                {lastUploadedName && (
                  <p className="muted">Last uploaded: <strong>{lastUploadedName}</strong></p>
                )}
              </div>
              <div>
                <h3>Format requirements</h3>
                <p className="muted">Only the first sheet is processed. Columns must appear exactly as below:</p>
                <div className="column-pill-grid">
                  {requiredColumns.map((col) => (
                    <span key={col} className="column-pill">
                      {col}
                    </span>
                  ))}
                </div>
                <p className="muted note">{analytics.notes}</p>
              </div>
            </div>
          </section>

          <section className="manual-card">
            <h2>Summary</h2>
            <div className="analytics-summary-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="summary-card">
                  <span className="muted">{card.label}</span>
                  <strong>{formatNumber(card.value)}</strong>
                </div>
              ))}
            </div>
          </section>

          <div className="analytics-chart-grid">
            {renderChartSection('Tag Distribution', analytics.tag_distribution, 'No tags available.')}
            {renderChartSection('Tokens by Category', analytics.token_by_category, 'No category data available.')}
            {renderChartSection(
              'Sentence Distribution',
              analytics.sentence_distribution,
              'No sentence distribution available.'
            )}
            {renderChartSection(
              'Sub-Category Distribution',
              analytics.sub_category_distribution,
              'No sub-category data available.'
            )}
          </div>
        </>
      )}

      {loading && <p className="muted">Loading analytics…</p>}
    </div>
  )
}

export default Analytics


