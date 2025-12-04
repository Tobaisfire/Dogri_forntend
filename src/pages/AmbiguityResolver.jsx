import { useMemo } from 'react'
import { useDataContext } from '../context/DataContext'

const SummaryCard = ({ label, value, muted }) => (
  <div className="summary-card">
    <span className="muted">{label}</span>
    <strong>{value}</strong>
    {muted && <small className="muted">{muted}</small>}
  </div>
)

const ExampleCard = ({ title, token, sentence, beforeTag, afterTag, explanation, badge }) => (
  <div className="manual-card example-card">
    <header>
      <div>
        <h4>{title}</h4>
        <p className="muted">
          <strong>{token}</strong> • {badge}
        </p>
      </div>
      <div className="tag-pair">
        <span className="badge">Pre: {beforeTag || '—'}</span>
        <span className="badge success">Post: {afterTag || '—'}</span>
      </div>
    </header>
    <p className="sentence">{sentence}</p>
    {explanation && <p className="muted">{explanation}</p>}
  </div>
)

function AmbiguityResolver() {
  const {
    ambiguitySummary,
    ambiguityExamples,
    ambiguityLoading,
    ambiguityError,
    reloadAmbiguity,
  } = useDataContext()

  const summary = ambiguitySummary
  const examples = ambiguityExamples ?? { doc_examples: [], dataset_examples: [] }

  const breakdownRows = useMemo(() => {
    if (!summary?.breakdown) return []
    return Object.entries(summary.breakdown).map(([key, value]) => ({
      label: key[0].toUpperCase() + key.slice(1),
      before: value.before,
      after: value.after,
      reduction: value.reduction_percent,
    }))
  }, [summary])

  return (
    <div className="ambiguity-panel">
      <header className="manual-header">
        <div>
          <h1>Ambiguity Resolver</h1>
          <p className="muted">Before/after analytics plus curated examples from the documentation and dataset.</p>
        </div>
        <button className="ghost" onClick={reloadAmbiguity} disabled={ambiguityLoading}>
          Refresh
        </button>
      </header>

      {ambiguityError && <div className="error-banner">{ambiguityError}</div>}
      {ambiguityLoading && <p className="muted">Loading ambiguity analytics…</p>}

      {summary && (
        <>
          <section className="manual-card">
            <h2>Resolution Impact</h2>
            <div className="analytics-summary-grid">
              <SummaryCard label="Total Sentences" value={summary.total_sentences?.toLocaleString() ?? '—'} />
              <SummaryCard
                label="Ambiguous (Before)"
                value={`${summary.ambiguity_rate_before ?? '—'}%`}
                muted={`${summary.ambiguous_sentences_before?.toLocaleString() ?? '—'} sentences`}
              />
              <SummaryCard
                label="Ambiguous (After)"
                value={`${summary.ambiguity_rate_after ?? '—'}%`}
                muted={`${summary.ambiguous_sentences_after?.toLocaleString() ?? '—'} sentences`}
              />
              <SummaryCard
                label="Reduction"
                value={`${summary.reduction_percent ?? '—'}%`}
                muted="After rules, lexicon & consensus"
              />
            </div>
          </section>

          <section className="manual-card">
            <h2>Breakdown by Ambiguity Type</h2>
            {!breakdownRows.length ? (
              <p className="muted">No breakdown data available.</p>
            ) : (
              <div className="breakdown-table">
                <div className="breakdown-row breakdown-head">
                  <span>Type</span>
                  <span>Before</span>
                  <span>After</span>
                  <span>Reduction</span>
                </div>
                {breakdownRows.map((row) => (
                  <div key={row.label} className="breakdown-row">
                    <span>{row.label}</span>
                    <span>{row.before.toLocaleString()}</span>
                    <span>{row.after.toLocaleString()}</span>
                    <span>{row.reduction}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {(examples.doc_examples?.length || examples.dataset_examples?.length) && (
        <div className="examples-grid">
          <section>
            <h3>Documentation Highlights</h3>
            {examples.doc_examples?.length ? (
              examples.doc_examples.map((item) => (
                <ExampleCard
                  key={item.token}
                  title="Curated Example"
                  token={item.token}
                  sentence={item.sentence}
                  beforeTag={item.before_tag}
                  afterTag={item.after_tag}
                  explanation={item.explanation}
                  badge={item.type}
                />
              ))
            ) : (
              <p className="muted">No documentation examples configured.</p>
            )}
          </section>

          <section>
            <h3>Dataset Examples</h3>
            {examples.dataset_examples?.length ? (
              examples.dataset_examples.map((item, idx) => (
                <ExampleCard
                  key={`${item.sentence_id}-${idx}`}
                  title={`Sentence ${item.sentence_index ?? 0}`}
                  token={item.token}
                  sentence={item.sentence}
                  beforeTag={item.pre_tag ?? '—'}
                  afterTag={item.post_tag ?? '—'}
                  explanation={item.description}
                  badge={`${item.type} • ${item.rule || 'Lexicon'}`}
                />
              ))
            ) : (
              <p className="muted">No dataset examples detected.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AmbiguityResolver


