"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { authService, type User } from "@/lib/services/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("finca_token")
    const storedUser = localStorage.getItem("finca_user")
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
        authService.me()
          .then((freshUser) => {
            setUser(freshUser)
            localStorage.setItem("finca_user", JSON.stringify(freshUser))
          })
          .catch(() => {
            localStorage.removeItem("finca_token")
            localStorage.removeItem("finca_user")
            setUser(null)
            setIsAuthenticated(false)
          })
          .finally(() => setLoading(false))
      } catch {
        localStorage.removeItem("finca_token")
        localStorage.removeItem("finca_user")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password)
      localStorage.setItem("finca_token", response.token)
      localStorage.setItem("finca_user", JSON.stringify(response.user))
      setUser(response.user)
      setIsAuthenticated(true)
      return true
    } catch {
      return false
    }
  }

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem("finca_token")
    localStorage.removeItem("finca_user")
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
