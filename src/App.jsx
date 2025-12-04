import { useState } from 'react'
import './App.css'
import { NAV_ITEMS } from './config'
import { useAuth } from './context/AuthContext'
import ManualTagging from './pages/ManualTagging'
import PosTagging from './pages/PosTagging'
import Analytics from './pages/Analytics'
import Placeholder from './pages/Placeholder'
import AmbiguityResolver from './pages/AmbiguityResolver'
import LearningParadigms from './pages/LearningParadigms'
import ModelComparison from './pages/ModelComparison'
import Profile from './pages/Profile'
import Login from './pages/Login'

const PANEL_COMPONENTS = {
  manual: ManualTagging,
  pos: PosTagging,
  analytics: Analytics,
  ambiguity: AmbiguityResolver,
  paradigms: LearningParadigms,
  comparison: ModelComparison,
  profile: Profile,
}

function App() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [activePanel, setActivePanel] = useState('manual')
  const ActiveComponent = PANEL_COMPONENTS[activePanel] ?? Placeholder

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Loading...</div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  // Show main app if authenticated
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
        <div className="sidebar-footer">
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App