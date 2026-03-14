import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { UserStoreProvider } from '@/hooks/useUserStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Landing } from '@/pages/Landing'

const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const NewGoal = lazy(() => import('@/pages/NewGoal').then(m => ({ default: m.NewGoal })))
const GoalDetail = lazy(() => import('@/pages/GoalDetail').then(m => ({ default: m.GoalDetail })))
const Analytics = lazy(() => import('@/pages/Analytics').then(m => ({ default: m.Analytics })))
const AISettings = lazy(() => import('@/pages/AISettings').then(m => ({ default: m.AISettings })))
const TargetBoard = lazy(() => import('@/pages/TargetBoard').then(m => ({ default: m.TargetBoard })))

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <UserStoreProvider>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
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
          </Suspense>
          <Toaster richColors position="bottom-right" />
        </UserStoreProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
