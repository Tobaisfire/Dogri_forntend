import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE, TAG_CATEGORIES, PAGE_SIZE, TOKENIZER_REGEX } from '../config'

const tokenizeSentence = (sentence = '') => {
  const matches = sentence.match(TOKENIZER_REGEX)
  return matches ?? []
}

function ManualTagging() {
  const [sentenceQueue, setSentenceQueue] = useState([])
  const [queueOffset, setQueueOffset] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tokens, setTokens] = useState([])
  const [tags, setTags] = useState([])
  const [selectedWordIdx, setSelectedWordIdx] = useState(null)
  const [categoryChoice, setCategoryChoice] = useState('')
  const [typeChoice, setTypeChoice] = useState('')
  const [taggedSentences, setTaggedSentences] = useState([])
  const [customSentence, setCustomSentence] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentSentence = sentenceQueue[currentIndex] ?? ''
  const taggedCount = useMemo(() => tags.filter(Boolean).length, [tags])
  const canSave = tokens.length > 0 && tags.length === tokens.length && taggedCount === tokens.length

  const ensureSentencePrepared = useCallback((sentence) => {
    const preparedTokens = tokenizeSentence(sentence)
    setTokens(preparedTokens)
    setTags(Array(preparedTokens.length).fill(null))
    setSelectedWordIdx(preparedTokens.length ? 0 : null)
    setCategoryChoice('')
    setTypeChoice('')
  }, [])

  const fetchSentences = useCallback(
    async (offset = 0, append = false) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE}/manual/sentences?limit=${PAGE_SIZE}&offset=${offset}`)
        if (!response.ok) {
          throw new Error('Unable to load sentences')
        }
        const data = await response.json()
        setSentenceQueue((prev) => (append ? [...prev, ...data.sentences] : data.sentences))
        if (!append && data.sentences.length) {
          setCurrentIndex(0)
          ensureSentencePrepared(data.sentences[0])
        }
        setQueueOffset(offset)
      } catch (err) {
        setError(err.message || 'Something went wrong while loading sentences.')
      } finally {
        setIsLoading(false)
      }
    },
    [ensureSentencePrepared]
  )

  useEffect(() => {
    fetchSentences(0, false)
  }, [fetchSentences])

  useEffect(() => {
    if (sentenceQueue.length && currentIndex < sentenceQueue.length) {
      ensureSentencePrepared(sentenceQueue[currentIndex])
    } else if (!sentenceQueue.length) {
      setTokens([])
      setTags([])
      setSelectedWordIdx(null)
    }
  }, [sentenceQueue, currentIndex, ensureSentencePrepared])

  const requestMoreSentencesIfNeeded = useCallback(() => {
    if (sentenceQueue.length - currentIndex <= 3) {
      const newOffset = queueOffset + sentenceQueue.length
      fetchSentences(newOffset, true)
    }
  }, [sentenceQueue.length, currentIndex, queueOffset, fetchSentences])

  const handleAssignTag = () => {
    if (selectedWordIdx == null || !categoryChoice || !typeChoice) return
    setTags((prev) => prev.map((tag, idx) => (idx === selectedWordIdx ? typeChoice : tag)))
  }

  const handleSkip = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, sentenceQueue.length))
    requestMoreSentencesIfNeeded()
  }

  const handleSave = () => {
    if (!canSave) return
    const formatted = tokens.map((tok, idx) => `${tok}/${tags[idx]}`).join(' ')
    setTaggedSentences((prev) => [...prev, { sentence: currentSentence, tagged: formatted }])
    setCurrentIndex((prev) => Math.min(prev + 1, sentenceQueue.length))
    requestMoreSentencesIfNeeded()
  }

  const handleAddSentence = async () => {
    const trimmed = customSentence.trim()
    if (!trimmed) return
    try {
      await fetch(`${API_BASE}/manual/sentences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentences: [trimmed] })
      })
      setSentenceQueue((prev) => [...prev, trimmed])
      setCustomSentence('')
    } catch {
      setError('Failed to add sentence to queue.')
    }
  }

  const handleDownload = () => {
    if (!taggedSentences.length) return
    const payload = taggedSentences
      .map((item, idx) => `Sentence ${idx + 1}:\n${item.sentence}\nTagged: ${item.tagged}\n`)
      .join('\n')
    const blob = new Blob([payload], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dogri_tagged_sentences.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="manual-panel">
      <header className="manual-header">
        <div>
          <h1>Tagging</h1>
          <p className="muted">
            Sentence {Math.min(currentIndex + 1, sentenceQueue.length || 1)} / {sentenceQueue.length || '-'}
          </p>
        </div>
        <div className="header-actions">
          <button className="ghost-button" onClick={() => fetchSentences(0, false)}>
            Reload Corpus
          </button>
        </div>
      </header>

      <section className="manual-card">
        <div className="sentence-board">
          {isLoading && !currentSentence ? 'Loading sentence…' : currentSentence || 'No sentence available'}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {tokens.length ? (
          <>
            <div className="token-board">
              {tokens.map((token, idx) => {
                const isSelected = idx === selectedWordIdx
                const appliedTag = tags[idx]
                return (
                  <button
                    key={`${token}-${idx}`}
                    className={`token-chip ${isSelected ? 'selected' : ''} ${appliedTag ? 'tagged' : ''}`}
                    onClick={() => setSelectedWordIdx(idx)}
                  >
                    <span>{token}</span>
                    {appliedTag && <span className="token-tag-pill">{appliedTag}</span>}
                  </button>
                )
              })}
            </div>

            <div className="selector-row">
              <label className="selector">
                <span>Category</span>
                <select
                  value={categoryChoice}
                  onChange={(e) => {
                    setCategoryChoice(e.target.value)
                    setTypeChoice('')
                  }}
                >
                  <option value="">Select Category *</option>
                  {Object.keys(TAG_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="selector">
                <span>Type</span>
                <select
                  value={typeChoice}
                  onChange={(e) => setTypeChoice(e.target.value)}
                  disabled={!categoryChoice}
                >
                  <option value="">Select Type *</option>
                  {categoryChoice &&
                    TAG_CATEGORIES[categoryChoice].map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                </select>
              </label>

              <button
                className="primary ghost"
                disabled={!categoryChoice || !typeChoice || selectedWordIdx == null}
                onClick={handleAssignTag}
              >
                Assign Tag
              </button>
            </div>

            <div className="manual-controls">
              <span className="progress-pill">
                Words: {taggedCount}/{tokens.length}
              </span>
              <div className="action-buttons">
                <button className="ghost danger" onClick={handleSkip}>
                  Skip
                </button>
                <button className="primary" disabled={!canSave} onClick={handleSave}>
                  Save & Next
                </button>
              </div>
            </div>
          </>
        ) : (
          !isLoading && <p className="muted">No sentence available. Try reloading the corpus.</p>
        )}
      </section>

      <section className="source-panel">
        <h2>Sentence Source</h2>
        <p className="muted">Add your own Dogri sentences to the queue. They will be appended after the current batch.</p>
        <div className="custom-input">
          <textarea
            value={customSentence}
            onChange={(e) => setCustomSentence(e.target.value)}
            placeholder="Enter a Dogri sentence"
            rows={3}
          />
          <button className="primary" onClick={handleAddSentence}>
            Queue Sentence
          </button>
        </div>
      </section>

      <section className="tagged-summary">
        <div className="summary-header">
          <div>
            <h2>Tagged Sentences</h2>
            <p className="muted">{taggedSentences.length} sentences saved locally this session.</p>
          </div>
          <button className="primary ghost" disabled={!taggedSentences.length} onClick={handleDownload}>
            Download
          </button>
        </div>
        <div className="tagged-list">
          {taggedSentences.length === 0 ? (
            <p className="muted">You have not saved any sentences yet.</p>
          ) : (
            taggedSentences.map((item, idx) => (
              <article key={idx} className="tagged-item">
                <h3>Sentence {idx + 1}</h3>
                <p>{item.sentence}</p>
                <code>{item.tagged}</code>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default ManualTagging

