import { createContext, useContext, ReactNode } from 'react'

export interface AuthUser {
  userId: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  signOut: (() => void) | null
}

const AuthContext = createContext<AuthContextValue>({ user: null, signOut: null })

export function AuthProvider({
  user,
  signOut,
  children,
}: {
  user: AuthUser | null
  signOut: (() => void) | null
  children: ReactNode
}) {
  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
