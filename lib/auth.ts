// Auth stub — swappable with NextAuth, Clerk, Supabase Auth, etc.
// The useAuth() interface is the only contract the rest of the app depends on.
// To add real auth: replace the localStorage calls inside login/register/logout
// with calls to your auth provider, keeping the same return shape.

import { useEffect, useState, useCallback } from 'react'

const USER_KEY = 'sb_user'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      setUser(raw ? (JSON.parse(raw) as AuthUser) : null)
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [])

  // TODO: replace with POST /api/auth/login or provider SDK call
  const login = useCallback((email: string): AuthUser | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      const stored = raw ? (JSON.parse(raw) as AuthUser) : null
      if (stored?.email === email) {
        setUser(stored)
        return stored
      }
    } catch {}
    return null
  }, [])

  // TODO: replace with POST /api/auth/register or provider SDK call
  const register = useCallback((email: string, name: string): AuthUser => {
    const newUser: AuthUser = { id: crypto.randomUUID(), email, name }
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
