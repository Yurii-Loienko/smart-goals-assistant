import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/hooks/useUserStore'
import { useTheme } from '@/hooks/useTheme'
import { useGistSync } from '@/hooks/useGistSync'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { hasApiKey } from '@/hooks/useClaudeAPI'
import { buildWorkdayExport } from '@/lib/formatters'
import { parseGoalDate, formatDateDisplay, isOverdue } from '@/lib/dates'
import { GoalCard } from '@/components/goals/GoalCard'
import { PrintView } from '@/components/goals/PrintView'
import { ProgressOverview } from '@/components/goals/ProgressOverview'
import { YearSelector } from '@/components/YearSelector'
import { GenerateModal } from '@/components/GenerateModal'
import { KeyboardHelp } from '@/components/KeyboardHelp'
import { Button } from '@/components/ui/button'
import { Goal, GoalCategory, GoalStatus } from '@/types'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Sparkles, User, Moon, Sun, ClipboardCopy, Cloud, Loader2, Search, Printer, BarChart3, Download, Zap, Bot, Kanban } from 'lucide-react'
import { createSeedGoals } from '@/lib/seedGoals'

const sections: { category: GoalCategory; title: string }[] = [
  { category: 'performance', title: 'Performance Targets' },
  { category: 'development', title: 'Development Targets' },
  { category: 'organizational', title: 'Organizational Targets' },
]

type StatusFilter = 'all' | GoalStatus

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { goals, profile, currentYear, setCurrentYear, getYearsWithData, clearAllGoals, replaceGoals } = useUserStore()
  const { theme, toggleTheme } = useTheme()
  const gist = useGistSync()
  useKeyboardShortcuts()
  const [showGenerate, setShowGenerate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (!profile) {
    return <Navigate to="/" replace />
  }

  const searchLower = searchQuery.toLowerCase()
  const filteredGoals = goals.filter((g: Goal) => {
    const matchesStatus = statusFilter === 'all' || (g.status || 'draft') === statusFilter
    const matchesSearch = !searchQuery ||
      g.targetName.toLowerCase().includes(searchLower) ||
      g.targetDetails.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  const groupedGoals = sections.map((s) => ({
    ...s,
    goals: filteredGoals.filter((g: Goal) => g.category === s.category),
  }))

  const yearsWithData = getYearsWithData()

  const handleSeedGoals = () => {
    clearAllGoals()
    const seedGoals = createSeedGoals()
    replaceGoals(seedGoals, 2026)
    toast.success(`All goals cleared. ${seedGoals.length} targets loaded for 2026!`)
  }

  const handleCopyAll = async () => {
    const text = buildWorkdayExport(goals)
    if (!text) {
      toast.info('No goals to copy')
      return
    }
    await navigator.clipboard.writeText(text)
    toast.success('All goals copied for Workday!')
  }

  const focusMilestones = goals
    .flatMap((g) => g.milestones
      .filter((m) => m.status !== 'completed')
      .map((m) => ({ ...m, goalName: g.targetName, goalId: g.id }))
    )
    .filter((m) => {
      const d = parseGoalDate(m.dueDate)
      if (!d) return false
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const limit = new Date(now)
      limit.setDate(limit.getDate() + 60)
      return d <= limit
    })
    .sort((a, b) => {
      const da = parseGoalDate(a.dueDate)
      const db = parseGoalDate(b.dueDate)
      return (da?.getTime() || 0) - (db?.getTime() || 0)
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto p-6 no-print">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">My Goals</h1>
          <div className="flex items-center gap-2">
            {gist.isConfigured && (
              <Button
                variant="ghost"
                size="icon"
                title={gist.lastSync ? `Last sync: ${new Date(gist.lastSync).toLocaleString()}` : 'Push to cloud'}
                disabled={gist.loading}
                onClick={async () => {
                  try {
                    await gist.push()
                    toast.success('Synced to GitHub Gist')
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Sync failed')
                  }
                }}
              >
                {gist.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
              </Button>
            )}
            <KeyboardHelp />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/board')} title="Target Board">
              <Kanban className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/ai-settings')} title="AI Settings">
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-1" /> {profile.name}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { navigate('/'); }}>
              Switch User
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <YearSelector
            currentYear={currentYear}
            availableYears={yearsWithData}
            onChange={setCurrentYear}
          />
          <div className="flex gap-2">
            {goals.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <ClipboardCopy className="h-4 w-4 mr-1" /> Copy for Workday
                </Button>
              </>
            )}
            {hasApiKey() && (
              <Button size="sm" onClick={() => setShowGenerate(true)}>
                <Sparkles className="h-4 w-4 mr-1" /> Generate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSeedGoals} title="Clear all goals and load 8 predefined targets for 2026">
              <Download className="h-4 w-4 mr-1" /> Load 2026
            </Button>
            <Button variant={hasApiKey() ? 'outline' : 'default'} size="sm" onClick={() => navigate('/goals/new')}>
              <Plus className="h-4 w-4 mr-1" /> Add Goal
            </Button>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
              className="pl-9"
            />
          </div>
        )}

        {goals.length > 0 && (
          <div className="flex gap-1 mb-6">
            {statusFilters.map((sf) => {
              const count =
                sf.value === 'all'
                  ? goals.length
                  : goals.filter((g: Goal) => (g.status || 'draft') === sf.value).length
              return (
                <Button
                  key={sf.value}
                  variant={statusFilter === sf.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(sf.value)}
                  className="text-xs"
                >
                  {sf.label} ({count})
                </Button>
              )
            })}
          </div>
        )}

        <ProgressOverview goals={goals} />

        {focusMilestones.length > 0 && (
          <Card className="mb-4 p-4 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Focus Now</span>
            </div>
            <div className="space-y-2">
              {focusMilestones.map((m, i) => {
                const overdue = isOverdue(m.dueDate)
                return (
                  <div
                    key={`${m.goalId}-${m.id}-${i}`}
                    className="flex items-center gap-3 text-sm cursor-pointer hover:bg-primary/10 rounded-md p-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/goals/${m.goalId}`)}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${overdue ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{m.id}</span>
                      <span className="text-muted-foreground"> — {m.description}</span>
                    </div>
                    <span className={`text-xs shrink-0 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                      {formatDateDisplay(m.dueDate)}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {goals.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} className="text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 mr-1" /> Detailed Analytics
            </Button>
          </div>
        )}

        {filteredGoals.length === 0 && goals.length > 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No goals matching your filters</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setStatusFilter('all'); setSearchQuery('') }}>
              Clear filters
            </Button>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16">
            <Plus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">No targets for {currentYear}</h2>
            <p className="text-muted-foreground mb-6">
              {hasApiKey()
                ? 'Generate targets from your profile or add them manually.'
                : 'Create your SMART performance targets manually.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleSeedGoals}>
                <Download className="h-4 w-4 mr-2" /> Load My Targets
              </Button>
              {hasApiKey() && (
                <Button variant="outline" onClick={() => setShowGenerate(true)}>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Targets
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/goals/new')}>
                <Plus className="h-4 w-4 mr-2" /> Add Goal
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedGoals.map(
              (section) =>
                section.goals.length > 0 && (
                  <div key={section.category}>
                    <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                      {section.title}
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section.goals.map((goal: Goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onClick={() => navigate(`/goals/${goal.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      <PrintView goals={goals} profile={profile} year={currentYear} />

      <GenerateModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
      />
    </div>
  )
}
