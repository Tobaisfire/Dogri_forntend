export const API_BASE = "https://tobaisfire-1-dogri-tag-backend.hf.space" ??   'http://127.0.0.1:8000'

export const TAG_CATEGORIES = {
  Noun: ['N_NC', 'N_NP', 'N_NST', 'N_NV'],
  Verb: ['V_VM', 'V_VA'],
  Pronoun: ['P_PPR'],
  Adjective: ['J_JJ', 'J_JQ'],
  Determiner: ['D_DAB'],
  Adverb: ['A_AMN'],
  Postposition: ['PP_PP'],
  Particles: ['C_CCD'],
  Numeral: ['NUM_NUMR'],
  Residual: ['RD_RDF'],
  Punctuation: ['PU_PU']
}

export const NAV_GROUPS = [
  {
    id: 'corpus',
    label: 'Corpus Development',
    items: [
      { id: 'manual', label: 'POS Annotation', caption: 'Manual Tagging' },
      { id: 'ambiguity', label: 'Ambiguity Resolution' },
      { id: 'analytics', label: 'Dataset Analytics' },
    ],
  },
  {
    id: 'linguistic-resources',
    label: 'Linguistic Resources',
    items: [{ id: 'linguistic', label: 'Tagset & Features' }],
  },
  {
    id: 'models',
    label: 'Model Development',
    items: [{ id: 'comparison', label: 'Model Comparison' }],
  },
  {
    id: 'evaluation',
    label: 'Adaptive Evaluation',
    items: [{ id: 'paradigms', label: 'Learning Paradigms' }],
  },
  {
    id: 'deployment',
    label: 'Deployment & Ensemble',
    items: [
      { id: 'pos', label: 'Live Tagger', caption: 'Our Tagging UI' },
      { id: 'ensemble', label: 'Ensemble Approach', caption: 'Proposed' },
    ],
  },
]

export const TOKENIZER_REGEX = /[\u0900-\u097Fa-zA-Z0-9]+|[^\s]/gu
export const PAGE_SIZE = 25
export const DEFAULT_POS_MODELS = ['SVM', 'HMM', 'BiLSTM', 'mBERT']
export const HYBRID_MODELS = ['SVM+BiLSTM', 'HMM+BiLSTM', 'SVM+mBERT', 'HMM+mBERT']
export const TAG_COLOR_MAP = {
  A_AMN: '#f97316',
  C_CCD: '#db2777',
  D_DAB: '#c59f46',
  J_JJ: '#1d4ed8',
  J_JQ: '#0f172a',
  NUM_NUMR: '#b91c1c',
  N_NC: '#ef4444',
  N_NP: '#facc15',
  N_NST: '#fb7185',
  N_NV: '#fda4af',
  PP_PP: '#34d399',
  PU_PU: '#65a30d',
  P_PPR: '#a3e635',
  RD_RDF: '#86efac',
  V_VA: '#60a5fa',
  V_VM: '#3b82f6'
}


