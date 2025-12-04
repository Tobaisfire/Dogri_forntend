import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState(null)

  // Check session storage on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated')
    const storedUsername = sessionStorage.getItem('username')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username, password) => {
    const validUsername = import.meta.env.VITE_LOGIN_USERNAME || 'admin'
    const validPassword = import.meta.env.VITE_LOGIN_PASSWORD || 'admin123'

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true)
      setUsername(username)
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('username', username)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername(null)
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('username')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

