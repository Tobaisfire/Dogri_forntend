import { useMemo, useState, useEffect } from 'react'
import { HYBRID_MODELS, TAG_CATEGORIES, TAG_COLOR_MAP } from '../config'
import { useModelList, usePosTagger } from '../hooks/usePosTagger'

const formatTime = (value) => `${(value ?? 0).toFixed(3)}s`
const VISUAL_MODES = [
  { id: 'simple', label: 'Tagging Results Only' },
  { id: 'visual', label: 'Tagging + Visualizations' },
]

function PosTagging() {
  const { models, metrics, error: modelsError } = useModelList()
  const {
    sentence,
    setSentence,
    selectedModels,
    setSelectedModels,
    tokens,
    results,
    timings,
    agreements,
    isLoading: taggingLoading,
    error: taggingError,
    runInference,
    fileResult,
    isFileLoading: fileLoading,
    fileError,
    runFileInference,
    resetFileWorkflow,
  } = usePosTagger()
  const [resultMode, setResultMode] = useState('')
  const [activeModelTab, setActiveModelTab] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const modelNames = Object.keys(results)
  useEffect(() => {
    if (modelNames.length && !activeModelTab) {
      setActiveModelTab(modelNames[0])
    }
  }, [modelNames, activeModelTab])

  const handleModelToggle = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const taggingDisabled = taggingLoading || !resultMode
  const fileTaggingDisabled = fileLoading || !selectedFile || !selectedModels.length

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    resetFileWorkflow()
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleFileTagging = () => {
    if (!selectedFile) return
    runFileInference(selectedFile)
  }

  const fileDownloadText = useMemo(() => {
    if (fileResult?.sentences?.length) {
      const lines = []
      fileResult.sentences.forEach((entry, idx) => {
        lines.push(`Sentence ${idx + 1}: ${entry.sentence}`)
        const tokensForLine = entry.tokens || []
        Object.entries(entry.models || {}).forEach(([modelName, payload]) => {
          const tags = payload?.tags || []
          const taggedPairs = tokensForLine.map((token, i) => `${token}/${tags[i] ?? '—'}`).join(' ')
          lines.push(`${modelName}: ${taggedPairs}`)
        })
        lines.push('')
      })
      return lines.join('\n').trim()
    }
    return fileResult?.content || ''
  }, [fileResult])

  const handleFileDownload = () => {
    if (!fileDownloadText) return
    const blob = new Blob([fileDownloadText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileResult.download_name || 'tagged.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filePreviewText = useMemo(() => {
    if (!fileResult?.content) return ''
    const lines = fileResult.content.split('\n')
    if (lines.length <= 8) {
      return fileResult.content
    }
    return [...lines.slice(0, 12), '...'].join('\n')
  }, [fileResult])

  const colorChips = tokens.map((token, idx) => {
    if (!activeModelTab) return null
    const tag = results?.[activeModelTab]?.[idx] ?? '—'
    const background = TAG_COLOR_MAP[tag] || '#1f2937'
    return (
      <span key={`${token}-${idx}`} className="tag-chip" style={{ background }}>
        {token}/{tag}
      </span>
    )
  })

  const tagLegend = Object.keys(TAG_CATEGORIES)
    .flatMap((category) => TAG_CATEGORIES[category])
    .map((tag) => (
      <span key={tag} className="legend-chip" style={{ background: TAG_COLOR_MAP[tag] || '#1f2937' }}>
        {tag}
      </span>
    ))

  const timeChartData = useMemo(() => {
    const entries = Object.entries(timings)
    if (!entries.length) return []
    const max = Math.max(...entries.map(([, value]) => value))
    return entries.map(([name, value]) => ({
      name,
      value,
      width: max ? (value / max) * 100 : 0,
    }))
  }, [timings])

  const tagDistribution = useMemo(() => {
    const distribution = {}
    Object.entries(results).forEach(([modelName, tagList]) => {
      distribution[modelName] = tagList.reduce((acc, tag) => {
        const key = tag ?? '—'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    })
    return distribution
  }, [results])

  const renderTagDistribution = () =>
    Object.entries(tagDistribution).map(([modelName, counts]) => (
      <div key={modelName} className="distribution-card">
        <h4>{modelName}</h4>
        <div className="distribution-grid">
          {Object.entries(counts).map(([tag, count]) => (
            <div key={`${modelName}-${tag}`} className="distribution-bar">
              <span>{tag}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: Math.min(100, count * 12) + '%', background: TAG_COLOR_MAP[tag] || '#3b82f6' }}
                />
              </div>
              <span className="muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    ))

  const renderResultsSection = () => {
    if (!tokens.length) {
      return <p className="muted">Enter a sentence, pick your result mode, and run tagging to see results.</p>
    }
    return (
      <>
        <section className="manual-card">
          <h2>Tokenized Sentence</h2>
          <div className="sentence-board">{tokens.join(' ')}</div>
        </section>

        <section className="manual-card">
          <h2>Tagging Results</h2>
          <div className="tab-bar">
            {modelNames.map((model) => (
              <button
                key={model}
                className={`tab ${activeModelTab === model ? 'active' : ''}`}
                onClick={() => setActiveModelTab(model)}
              >
                {model}
              </button>
            ))}
          </div>
          {activeModelTab && (
            <>
              <div className="sentence-board">
                {tokens.map((token, idx) => `${token}/${results[activeModelTab][idx] ?? '—'}`).join(' ')}
              </div>
              <h3>Color-Coded Tags</h3>
              <div className="tag-chip-row">{colorChips}</div>
              <h4>Tag Legend</h4>
              <div className="legend-row">{tagLegend}</div>
            </>
          )}
        </section>

        {resultMode === 'visual' && (
          <>
            <section className="manual-card">
              <h2>Processing Time Comparison</h2>
              {!timeChartData.length ? (
                <p className="muted">No timing data available.</p>
              ) : (
                <div className="time-chart">
                  {timeChartData.map((item) => (
                    <div key={item.name} className="time-bar">
                      <span>{item.name}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${item.width}%` }} />
                      </div>
                      <span className="muted">{formatTime(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="manual-card">
              <h2>Tag Distribution Analysis</h2>
              {modelNames.length ? renderTagDistribution() : <p className="muted">No data available.</p>}
            </section>
          </>
        )}
      </>
    )
  }

  return (
    <div className="pos-panel">
      <header className="manual-header">
        <div>
          <h1>POS Tagging</h1>
          <p className="muted">Compare model outputs side-by-side.</p>
        </div>
      </header>

      <section className="manual-card">
        <div className="pos-inputs">
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            rows={3}
            placeholder="Enter a Dogri sentence"
          />
          <div className="pos-mode-toggle">
            {VISUAL_MODES.map((mode) => (
              <label key={mode.id}>
                <input
                  type="radio"
                  name="result-mode"
                  value={mode.id}
                  checked={resultMode === mode.id}
                  onChange={(e) => setResultMode(e.target.value)}
                />
                {mode.label}
              </label>
            ))}
          </div>
          <button className="primary" onClick={runInference} disabled={taggingDisabled}>
            {taggingLoading ? 'Tagging...' : 'Run Tagging'}
          </button>
        </div>
        {taggingError && <div className="error-banner">{taggingError}</div>}
      </section>

      <section className="manual-card">
        <h2>Batch POS Tagging via Text File</h2>
        <p className="muted">
          Upload a plain text (<code>.txt</code>) file containing Dogri sentences. Sentences can be separated by new lines, <code>|</code>, or <code>।</code>.
        </p>
        <div className="file-upload-row">
          <label className="file-input-wrapper">
            <span>Select .txt file</span>
            <input type="file" accept=".txt" onChange={handleFileChange} />
          </label>
          {selectedFile ? (
            <span className="file-name-chip">{selectedFile.name}</span>
          ) : (
            <span className="muted">No file selected</span>
          )}
          <button className="secondary" onClick={handleFileTagging} disabled={fileTaggingDisabled}>
            {fileLoading ? 'Tagging File...' : 'Tag Uploaded File'}
          </button>
        </div>
        {fileError && <div className="error-banner">{fileError}</div>}
      </section>

      {fileResult && (
        <section className="manual-card">
          <div className="file-result-header">
            <div>
              <h2>Tagged File Ready</h2>
              <p className="muted">
                Processed {fileResult.sentences?.length ?? 0} sentences • Download as {fileResult.download_name}
              </p>
            </div>
            <button className="primary" onClick={handleFileDownload}>
              Download Tagged File
            </button>
          </div>
          <div className="sentence-board file-preview">
            {filePreviewText || 'Preview unavailable.'}
          </div>
          <p className="muted file-preview-note">Preview limited to the first 12 lines of the tagged output.</p>
        </section>
      )}

      <section className="manual-card">
        <h2>Model Selection</h2>
        {modelsError && <div className="error-banner">{modelsError}</div>}
        <div className="model-selection-grid">
          <div>
            <h3>Base Models</h3>
            <div className="model-chip-grid">
              {(models.base || []).map((model) => (
                <button
                  key={model}
                  className={`model-chip ${selectedModels.includes(model) ? 'active' : ''}`}
                  onClick={() => handleModelToggle(model)}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3>Hybrid Models</h3>
            <div className="model-chip-grid">
              {(models.hybrid ?? HYBRID_MODELS).map((model) => (
                <button
                  key={model}
                  className={`model-chip ${selectedModels.includes(model) ? 'active' : ''}`}
                  onClick={() => handleModelToggle(model)}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="manual-card">
        <h2>Selected Model Information</h2>
        {!selectedModels.length ? (
          <p className="muted">Select one or more models to see their metadata.</p>
        ) : (
          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>F1 Score</th>
                  <th>Trained On</th>
                  <th>Algorithm</th>
                </tr>
              </thead>
              <tbody>
                {selectedModels.map((model) => {
                  const info = metrics?.[model] || {}
                  return (
                    <tr key={model}>
                      <td>{model}</td>
                      <td>{info.accuracy != null ? `${(info.accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                      <td>{info.f1 != null ? `${(info.f1 * 100).toFixed(2)}%` : 'N/A'}</td>
                      <td>{info.trained_on || 'Dogri Corpus (200k tokens)'}</td>
                      <td>{info.algorithm || model}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {renderResultsSection()}
    </div>
  )
}

export default PosTagging



