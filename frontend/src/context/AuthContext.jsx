import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Mock user database for hackathon
const MOCK_USERS = {
  'demo@nyaymitra.in': { password: 'demo123', name: 'Demo User', uid: 'demo_uid_001' }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Restore session
    try {
      const savedUser = localStorage.getItem('nyaymitra_user')
      const savedToken = localStorage.getItem('nyaymitra_token')
      const guestMode = localStorage.getItem('nyaymitra_guest')
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
      } else if (guestMode === 'true') {
        setIsGuest(true)
      }
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Mock authentication
    const mockUser = MOCK_USERS[email]
    if (mockUser && mockUser.password === password) {
      const userData = { uid: mockUser.uid, email, name: mockUser.name }
      const fakeToken = btoa(`${email}:${Date.now()}`)
      localStorage.setItem('nyaymitra_user', JSON.stringify(userData))
      localStorage.setItem('nyaymitra_token', fakeToken)
      setUser(userData)
      setIsGuest(false)
      return userData
    }
    throw new Error('Invalid email or password')
  }

  const signup = async (email, password, name) => {
    const userData = { uid: `uid_${Date.now()}`, email, name }
    const fakeToken = btoa(`${email}:${Date.now()}`)
    localStorage.setItem('nyaymitra_user', JSON.stringify(userData))
    localStorage.setItem('nyaymitra_token', fakeToken)
    setUser(userData)
    setIsGuest(false)
    return userData
  }

  const loginWithGoogle = async () => {
    const userData = {
      uid: 'google_uid_001',
      email: 'google_user@gmail.com',
      name: 'Google User',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user'
    }
    const fakeToken = btoa(`google:${Date.now()}`)
    localStorage.setItem('nyaymitra_user', JSON.stringify(userData))
    localStorage.setItem('nyaymitra_token', fakeToken)
    setUser(userData)
    setIsGuest(false)
    return userData
  }

  const enterGuestMode = () => {
    localStorage.setItem('nyaymitra_guest', 'true')
    setIsGuest(true)
  }

  const logout = () => {
    localStorage.removeItem('nyaymitra_user')
    localStorage.removeItem('nyaymitra_token')
    localStorage.removeItem('nyaymitra_guest')
    setUser(null)
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, signup, loginWithGoogle, enterGuestMode, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
