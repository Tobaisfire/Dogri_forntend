function EnsembleOverview() {
  const selectedModels = [
    { name: 'phi-4 (LLM)', role: 'LLM', reason: 'High semantic coverage; strong on rare patterns' },
    { name: 'mBERT (fine-tuned)', role: 'Transformer', reason: 'Highest accuracy on Dogri; robust token context' },
    { name: 'BiLSTM-CRF', role: 'BiLSTM', reason: 'Sequential consistency and speed' },
  ]

  return (
    <div className="analytics-panel">
      <header className="manual-header">
        <div>
          <h1>Ensemble Approach (Proposed)</h1>
          <p className="muted">
            Shows how we can blend LLM, Transformer, and BiLSTM outputs while keeping the current tagger intact.
          </p>
        </div>
      </header>

      <section className="manual-card">
        <h2>Why an Ensemble?</h2>
        <p className="muted">Live tagger remains as-is; ensemble is an optional path to blend strengths.</p>
        <div className="feature-grid">
          {selectedModels.map((m) => (
            <div key={m.name} className="feature-card">
              <h3>{m.name}</h3>
              <p className="muted">{m.reason}</p>
              <span className="badge" style={{ background: '#6366f1', color: '#fff', marginTop: '0.5rem' }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="manual-card">
        <h2>Proposed Decision Logic (3-model vote)</h2>
        <ol className="feature-list">
          <li><strong>Agreement first:</strong> if all 3 agree, accept.</li>
          <li>
            <strong>Weighted vote on disagreement:</strong> phi-4 (LLM) &gt; mBERT (Transformer) &gt; BiLSTM-CRF.
            Tie-break by confidence; fallback to majority.
          </li>
          <li>
            <strong>Rule assist:</strong> for Dogri-specific cues (reduplication, suffix markers) adjust votes when
            confidence is low.
          </li>
        </ol>
      </section>

      <section className="manual-card">
        <h2>How This Fits the App</h2>
        <ul className="feature-list">
          <li>Keep the current POS Tagging page as the primary live tagger.</li>
          <li>Add an optional “Ensemble mode” toggle: routes requests through phi-4 + mBERT + BiLSTM-CRF.</li>
          <li>Show a small breakdown: which model won, where they disagreed, and the final vote.</li>
          <li>No change to existing tagging workflow; this is an additive option.</li>
        </ul>
      </section>
    </div>
  )
}

export default EnsembleOverview

