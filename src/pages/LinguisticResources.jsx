import { TAG_CATEGORIES, TAG_COLOR_MAP } from '../config'

function LinguisticResources() {
  const allTags = Object.values(TAG_CATEGORIES).flat()
  
  return (
    <div className="analytics-panel">
      <header className="manual-header">
        <div>
          <h1>Linguistic Resources</h1>
          <p className="muted">Layer 2: Tagset Adaptation, Morphological Features, and Embedding Generation</p>
        </div>
      </header>

      {/* Section 2.1: Tagset Adaptation */}
      <section className="manual-card">
        <h2>2.1 Tagset Adaptation</h2>
        <p className="muted">
          The ILPOSTS scheme was refined to include Dogri-specific grammatical behaviours such as reduplication, 
          honorific pronouns, compound postpositions, and verb–auxiliary constructions. New tags and decision 
          rules were added to extend the original scheme while maintaining alignment with ILPOSTS principles.
        </p>
        
        <div className="tagset-grid">
          {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
            <div key={category} className="tagset-category">
              <h3>{category}</h3>
              <div className="tag-list">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag-chip"
                    style={{ background: TAG_COLOR_MAP[tag] || '#1f2937' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="manual-card">
        <h2>Dogri Tagset (Reference)</h2>
        <p className="muted">Key tags highlighted for reference only; does not alter live tag outputs.</p>
        <div className="tag-legend-grid">
          {[
            { tag: 'NOUN', desc: 'Common noun', ex: 'किताब' },
            { tag: 'PRON', desc: 'Pronoun', ex: 'वह' },
            { tag: 'PRON-HON*', desc: 'Honorific pronoun (Dogri-specific)', ex: 'आप' },
            { tag: 'PSP', desc: 'Postposition', ex: 'में' },
            { tag: 'PSP-COMP*', desc: 'Compound postposition (Dogri-specific)', ex: 'के बाद' },
            { tag: 'AUX', desc: 'Auxiliary verb', ex: 'है' },
            { tag: 'RDP*', desc: 'Reduplicated form (Dogri-specific)', ex: 'धीरे-धीरे' },
            { tag: 'VM', desc: 'Main verb', ex: 'गया' },
          ].map(({ tag, desc, ex }) => (
            <div key={tag} className="legend-item">
              <span className="legend-chip" style={{ background: TAG_COLOR_MAP[tag] || '#1f2937' }}>
                {tag}
              </span>
              <div className="legend-text">
                <strong>{desc}</strong>
                <small className="muted">Example: {ex}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2.2: Morphological Feature Extraction */}
      <section className="manual-card">
        <h2>2.2 Morphological Feature Extraction</h2>
        <p className="muted">
          Dogri grammar rules were documented to enable rule-aware feature interpretation, especially for 
          suffix-based case marking and verb inflections.
        </p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Suffix-based Case Marking</h3>
            <p className="muted">
              Dogri uses postpositions and case markers that attach as suffixes to nouns. These morphological 
              features are captured during tokenization and tagging.
            </p>
            <div className="example-box">
              <strong>Example:</strong> <code>किताब</code> (book) + <code>में</code> (in) → <code>किताब में</code>
            </div>
          </div>
          
          <div className="feature-card">
            <h3>Verb Inflections</h3>
            <p className="muted">
              Dogri verbs exhibit complex inflectional patterns including tense, aspect, mood, and agreement 
              markers that are captured in the tagging process.
            </p>
            <div className="example-box">
              <strong>Example:</strong> <code>खाना</code> (to eat) → <code>खाता है</code> (eats)
            </div>
          </div>
          
          <div className="feature-card">
            <h3>Reduplication</h3>
            <p className="muted">
              Dogri uses reduplication for emphasis and grammatical functions, which is captured as a distinct 
              morphological feature.
            </p>
            <div className="example-box">
              <strong>Example:</strong> <code>धीरे-धीरे</code> (slowly-slowly)
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.3: Embedding Generation */}
      <section className="manual-card">
        <h2>2.3 Embedding Generation</h2>
        <p className="muted">
          Two embedding models—Word2Vec and FastText—were trained on the cleaned corpus. FastText was selected 
          for downstream modelling due to its superior handling of subword morphology.
        </p>
        
        <div className="embedding-comparison">
          <div className="embedding-card">
            <h3>Word2Vec</h3>
            <p className="muted">
              Traditional word-level embeddings that capture semantic relationships between words. Effective for 
              common words but struggles with rare or out-of-vocabulary terms.
            </p>
            <ul className="feature-list">
              <li>Word-level representation</li>
              <li>Good for common vocabulary</li>
              <li>Limited OOV handling</li>
            </ul>
          </div>
          
          <div className="embedding-card highlight">
            <h3>FastText <span className="badge">Selected</span></h3>
            <p className="muted">
              Subword-level embeddings that break words into character n-grams. Superior handling of subword 
              morphology makes it ideal for Dogri's morphological complexity.
            </p>
            <ul className="feature-list">
              <li>Subword-level representation</li>
              <li>Excellent OOV handling</li>
              <li>Captures morphological patterns</li>
              <li>Better for low-resource languages</li>
            </ul>
          </div>
        </div>
        
        <div className="info-box">
          <strong>Selection Rationale:</strong> FastText was chosen for downstream modelling because Dogri exhibits 
          rich morphological variation, and FastText's subword approach better captures these patterns, especially 
          for rare words and morphological variants.
        </div>
      </section>

      {/* Tag Legend */}
      <section className="manual-card">
        <h2>Complete Tagset Reference</h2>
        <div className="tag-legend-grid">
          {allTags.map((tag) => (
            <div key={tag} className="legend-item">
              <span
                className="legend-chip"
                style={{ background: TAG_COLOR_MAP[tag] || '#1f2937' }}
              >
                {tag}
              </span>
              <span className="muted">{tag}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LinguisticResources

