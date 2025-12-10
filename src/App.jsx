import { useState } from 'react'
import './App.css'
import { NAV_GROUPS } from './config'
import ManualTagging from './pages/ManualTagging'
import PosTagging from './pages/PosTagging'
import Analytics from './pages/Analytics'
import Placeholder from './pages/Placeholder'
import AmbiguityResolver from './pages/AmbiguityResolver'
import LearningParadigms from './pages/LearningParadigms'
import ModelComparison from './pages/ModelComparison'
import Profile from './pages/Profile'
import LinguisticResources from './pages/LinguisticResources'
import EnsembleOverview from './pages/EnsembleOverview'

const PANEL_COMPONENTS = {
  manual: ManualTagging,
  pos: PosTagging,
  analytics: Analytics,
  ambiguity: AmbiguityResolver,
  paradigms: LearningParadigms,
  comparison: ModelComparison,
  profile: Profile,
  linguistic: LinguisticResources,
  ensemble: EnsembleOverview,
}

function App() {
  const [activePanel, setActivePanel] = useState('pos')
  const [openGroups, setOpenGroups] = useState(() => new Set())
  const ActiveComponent = PANEL_COMPONENTS[activePanel] ?? Placeholder

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>डोगरी</h1>
          <span>Tag</span>
        </div>
        <nav>
          {NAV_GROUPS.map((group) => {
            const open = openGroups.has(group.id)
            return (
              <div key={group.id} className="nav-group">
                <button className="nav-group-toggle" onClick={() => toggleGroup(group.id)}>
                  <span>{group.label}</span>
                  <span className={`caret ${open ? 'open' : ''}`}>▾</span>
                </button>
                {open && (
                  <div className="nav-group-items">
                    {group.items.map((item, idx) => (
                      <button
                        key={item.id}
                        className={`nav-link ${activePanel === item.id ? 'active' : ''}`}
                        onClick={() => setActivePanel(item.id)}
                      >
                        <div className="nav-line">
                          <span className="nav-index">{idx + 1}.</span>
                          <span className="nav-title">{item.label}</span>
                        </div>
                        {item.caption && <small>{item.caption}</small>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App