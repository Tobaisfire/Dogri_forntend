import { useState } from 'react'
import './App.css'
import { NAV_ITEMS } from './config'
import ManualTagging from './pages/ManualTagging'
import PosTagging from './pages/PosTagging'
import Analytics from './pages/Analytics'
import Placeholder from './pages/Placeholder'

const PANEL_COMPONENTS = {
  manual: ManualTagging,
  pos: PosTagging,
  analytics: Analytics,
  comparison: () => <Placeholder title="Examples" />,
  profile: () => <Placeholder title="Profile" />,
}

function App() {
  const [activePanel, setActivePanel] = useState('manual')
  const ActiveComponent = PANEL_COMPONENTS[activePanel] ?? Placeholder

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>डोगरी</h1>
          <span>Tag</span>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => setActivePanel(item.id)}
            >
              {item.caption ? (
                <>
                  <span className="nav-title">{item.label}</span>
                  <small>{item.caption}</small>
                </>
              ) : (
                <span className="nav-title">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App