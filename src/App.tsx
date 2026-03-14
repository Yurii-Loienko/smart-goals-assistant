import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { UserStoreProvider } from '@/hooks/useUserStore'
import { AuthProvider, AuthUser } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Landing } from '@/pages/Landing'

const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const NewGoal = lazy(() => import('@/pages/NewGoal').then(m => ({ default: m.NewGoal })))
const GoalDetail = lazy(() => import('@/pages/GoalDetail').then(m => ({ default: m.GoalDetail })))
const Analytics = lazy(() => import('@/pages/Analytics').then(m => ({ default: m.Analytics })))
const AISettings = lazy(() => import('@/pages/AISettings').then(m => ({ default: m.AISettings })))
const TargetBoard = lazy(() => import('@/pages/TargetBoard').then(m => ({ default: m.TargetBoard })))

const Loading = (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

function CognitoRoutes() {
  return (
    <Suspense fallback={Loading}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goals/new" element={<NewGoal />} />
        <Route path="/goals/:id" element={<GoalDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-settings" element={<AISettings />} />
        <Route path="/board" element={<TargetBoard />} />
      </Routes>
      <Toaster richColors position="bottom-right" />
    </Suspense>
  )
}

function LocalRoutes() {
  return (
    <Suspense fallback={Loading}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goals/new" element={<NewGoal />} />
        <Route path="/goals/:id" element={<GoalDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-settings" element={<AISettings />} />
        <Route path="/board" element={<TargetBoard />} />
      </Routes>
      <Toaster richColors position="bottom-right" />
    </Suspense>
  )
}

function AuthenticatedApp({ signOut }: { signOut: () => void }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const session = await fetchAuthSession()
        const user = await getCurrentUser()
        const email = (session.tokens?.idToken?.payload?.email as string) || user.signInDetails?.loginId || ''
        setAuthUser({ userId: user.userId, email })
      } catch {
        setAuthUser(null)
      }
    }
    load()
  }, [])

  if (!authUser) return Loading

  return (
    <AuthProvider user={authUser} signOut={signOut}>
      <UserStoreProvider cognitoUser={authUser}>
        <CognitoRoutes />
      </UserStoreProvider>
    </AuthProvider>
  )
}

export default function App() {
  const [amplifyReady, setAmplifyReady] = useState<boolean | null>(null)

  useEffect(() => {
    fetchAuthSession()
      .then(() => setAmplifyReady(true))
      .catch(() => setAmplifyReady(false))
  }, [])

  if (amplifyReady === null) return Loading

  if (!amplifyReady) {
    return (
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider user={null} signOut={null}>
            <UserStoreProvider>
              <LocalRoutes />
            </UserStoreProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    )
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <BrowserRouter>
          <ErrorBoundary>
            <AuthenticatedApp signOut={signOut!} />
          </ErrorBoundary>
        </BrowserRouter>
      )}
    </Authenticator>
  )
}
