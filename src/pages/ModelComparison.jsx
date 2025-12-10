import { useMemo } from 'react'

// Models from "Overall POS tagging performance on Dogri" table (learning paradigms doc)
const ALL_MODELS = {
  // Traditional ML
  'HMM': { accuracy: 78.4, f1: 74.1, type: 'ML', category: 'Traditional ML', training: 'Dogri only', size: '4000 sentences', approach: 'Fully Supervised' },
  'SVM': { accuracy: 80.2, f1: 76.3, type: 'ML', category: 'Traditional ML', training: 'Dogri only', size: '4000 sentences', approach: 'Fully Supervised' },
  
  // Deep Learning (including BERTs)
  'BiLSTM-CRF': { accuracy: 90.4, f1: 87.9, type: 'DL', category: 'Deep Learning', training: 'Dogri only', size: '4000 sentences', approach: 'Fully Supervised' },
  'mBERT (Fine-tuned)': { accuracy: 93.1, f1: 91.4, type: 'DL', category: 'Deep Learning', training: 'Hindi + Dogri', size: '4000 sentences', approach: 'Fine-tuned' },
  'IndicBERT (Few-shot)': { accuracy: 88.3, f1: 86.2, type: 'DL', category: 'Deep Learning', training: 'Hindi + Punjabi + Dogri', size: '500 sentences', approach: 'Few-shot' },
  'XLM-R (Fine-tuned)': { accuracy: 91.8, f1: 90.1, type: 'DL', category: 'Deep Learning', training: 'Hindi + Dogri', size: '4000 sentences', approach: 'Fine-tuned' },
  
  // Large Language Models
  'phi-4-fine-tuned': { accuracy: 90.0, f1: 89.0, type: 'LLM', category: 'Large Language Model', training: 'Dogri', size: 'Fine-tuned', approach: 'Fine-tuned' },
  'GPT-4 (Few-shot, Dogri)': { accuracy: 88.1, f1: 85.4, type: 'LLM', category: 'Large Language Model', training: 'Dogri', size: 'Few-shot', approach: 'Few-shot' },
  'GPT-4 (Few-shot, Hindi)': { accuracy: 86.7, f1: 83.9, type: 'LLM', category: 'Large Language Model', training: 'Hindi', size: 'Few-shot', approach: 'Few-shot' },
  'Claude 3 (Few-shot, Dogri)': { accuracy: 87.3, f1: 84.6, type: 'LLM', category: 'Large Language Model', training: 'Dogri', size: 'Few-shot', approach: 'Few-shot' },
  'LLaMA-2 (Zero-shot)': { accuracy: 76.2, f1: 72.5, type: 'LLM', category: 'Large Language Model', training: 'None', size: '0', approach: 'Zero-shot' },
  'LLaMA-2 (Few-shot, Hindi)': { accuracy: 80.8, f1: 77.1, type: 'LLM', category: 'Large Language Model', training: 'Hindi', size: 'Few-shot', approach: 'Few-shot' },
}

function ModelComparison() {
  const allModels = useMemo(() => {
    return Object.entries(ALL_MODELS)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
  }, [])

  const mlModels = useMemo(
    () => allModels.filter((m) => m.type === 'ML'),
    [allModels]
  )
  const dlModels = useMemo(
    () => allModels.filter((m) => m.type === 'DL'),
    [allModels]
  )
  const llmModels = useMemo(
    () => allModels.filter((m) => m.type === 'LLM'),
    [allModels]
  )

  const bestML = useMemo(() => mlModels.length > 0 ? mlModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), mlModels[0]) : null, [mlModels])
  const bestDL = useMemo(() => dlModels.length > 0 ? dlModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), dlModels[0]) : null, [dlModels])
  const bestOverall = useMemo(() => allModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), allModels[0]), [allModels])

  const getTypeColor = (type) => {
    const colors = {
      ML: '#ef4444',
      DL: '#3b82f6',
      LLM: '#8b5cf6',
    }
    return colors[type] || '#6b7280'
  }

  const ModelCard = ({ model, highlight = false }) => (
    <div
      className={`model-card ${highlight ? 'highlight' : ''}`}
      style={{ borderLeft: `4px solid ${getTypeColor(model.type)}` }}
    >
      <div className="model-card-header">
        <div>
          <h3>
            {model.name}
            {highlight && <span className="badge best-badge">Best</span>}
          </h3>
          <p className="model-category">{model.category}</p>
        </div>
        <div className="model-type-tag" style={{ background: getTypeColor(model.type) }}>
          {model.type}
        </div>
      </div>
      <div className="model-metrics">
        <div className="metric">
          <span className="metric-label">Accuracy</span>
          <span className="metric-value">{model.accuracy.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">F1-Score</span>
          <span className="metric-value">{model.f1.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="analytics-panel">
      <header className="manual-header">
        <div>
          <h1>Model Comparison</h1>
          <p className="muted">Classical ML, Deep Learning, Transformers, and LLMs side-by-side.</p>
        </div>
      </header>

      {/* Overall Best Model - Hero Section */}
      <section className="manual-card hero-section">
        <div className="hero-content">
          <div className="hero-icon">🏆</div>
          <div>
            <h2>Best Overall Model</h2>
            <p className="hero-model-name">{bestOverall.name}</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <span className="hero-metric-label">Accuracy</span>
                <span className="hero-metric-value">{bestOverall.accuracy.toFixed(1)}%</span>
              </div>
              <div className="hero-metric">
                <span className="hero-metric-label">F1-Score</span>
                <span className="hero-metric-value">{bestOverall.f1.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Winners */}
      <section className="manual-card">
        <h2>Category Winners</h2>
        <div className="category-winners-grid">
          <div className="category-winner">
            <h3>Best ML Model</h3>
            <p className="winner-name">{bestML?.name || 'N/A'}</p>
            <p className="winner-score">{bestML?.accuracy.toFixed(1)}% Accuracy</p>
          </div>
          <div className="category-winner">
            <h3>Best DL Model</h3>
            <p className="winner-name">{bestDL?.name || 'N/A'}</p>
            <p className="winner-score">{bestDL?.accuracy.toFixed(1)}% Accuracy</p>
          </div>
          <div className="category-winner">
            <h3>Best LLM Model</h3>
            <p className="winner-name">{llmModels.length > 0 ? llmModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), llmModels[0]).name : 'N/A'}</p>
            <p className="winner-score">{llmModels.length > 0 ? llmModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), llmModels[0]).accuracy.toFixed(1) : 'N/A'}% Accuracy</p>
          </div>
        </div>
      </section>

      {/* All Models by Category */}
      <section className="manual-card">
        <h2>All Models by Category</h2>
        <div className="models-grid">
          {allModels.map((model, i) => (
            <ModelCard key={i} model={model} highlight={model.name === bestOverall.name} />
          ))}
        </div>
      </section>

      {/* All Models Ranked */}
      <section className="manual-card">
        <h2>All Models Ranked by Accuracy</h2>
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Model Name</th>
                <th>Type</th>
                <th>Accuracy (%)</th>
                <th>F1-Score (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allModels.map((model, i) => (
                <tr key={i} className={model.name === bestOverall.name ? 'best-row' : ''}>
                  <td>
                    <strong>#{i + 1}</strong>
                  </td>
                  <td>
                    <strong>{model.name}</strong>
                  </td>
                  <td>
                    <span className="type-badge" style={{ background: getTypeColor(model.type) }}>
                      {model.type}
                    </span>
                  </td>
                  <td>{model.accuracy.toFixed(1)}</td>
                  <td>{model.f1.toFixed(1)}</td>
                  <td>
                    {model.name === bestOverall.name && <span className="badge best-badge">Best Overall</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conclusions */}
      <section className="manual-card conclusions-section">
        <h2>Conclusions</h2>
        <div className="conclusions-content">
          <div className="conclusion-item">
            <h3>🎯 Best Solo Models</h3>
            <p>
              <strong>Best ML Model:</strong> {bestML?.name} with {bestML?.accuracy.toFixed(1)}% accuracy. Traditional
              machine learning approaches like SVM show competitive performance for Dogri POS tagging.
            </p>
            <p>
              <strong>Best DL Model:</strong> {bestDL?.name} with {bestDL?.accuracy.toFixed(1)}% accuracy. Deep learning
              models like BiLSTM capture sequential patterns effectively in Dogri text.
            </p>
          </div>

          <div className="conclusion-item">
            <h3>🤖 Best LLM Model</h3>
            <p>
              <strong>{llmModels.length > 0 ? llmModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), llmModels[0]).name : 'N/A'}</strong> achieves{' '}
              {llmModels.length > 0 ? llmModels.reduce((best, curr) => (curr.accuracy > best.accuracy ? curr : best), llmModels[0]).accuracy.toFixed(1) : 'N/A'}% accuracy, demonstrating
              that large language models with fine-tuning or few-shot learning can achieve excellent performance for Dogri POS tagging.
            </p>
          </div>

          <div className="conclusion-item highlight-conclusion">
            <h3>🏆 Overall Best Model</h3>
            <p>
              <strong>{bestOverall.name}</strong> stands out as the top performer with{' '}
              <strong>{bestOverall.accuracy.toFixed(1)}% accuracy</strong> and{' '}
              <strong>{bestOverall.f1.toFixed(1)}% F1-score</strong>. This model represents the state-of-the-art for
              Dogri POS tagging, achieving superior performance through {bestOverall.category.toLowerCase()}.
            </p>
          </div>

          <div className="conclusion-item">
            <h3>📊 Key Insights</h3>
            <ul>
              <li>
                <strong>Transformer models</strong> (mBERT, IndicBERT) show strong performance, benefiting from
                pre-trained multilingual representations.
              </li>
              <li>
                <strong>Deep Learning models</strong> including BERT-based architectures (mBERT, IndicBERT) show strong
                performance when fine-tuned on Dogri data.
              </li>
              <li>
                <strong>Large Language Models</strong> (phi-4, GPT-4) achieve excellent results, especially when
                fine-tuned, indicating the potential of modern LLMs for low-resource languages.
              </li>
              <li>
                <strong>Traditional ML</strong> models (SVM, HMM) remain competitive and provide fast, interpretable
                baselines.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ModelComparison

