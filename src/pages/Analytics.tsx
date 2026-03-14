import { useNavigate, Navigate } from 'react-router-dom'
import { useUserStore } from '@/hooks/useUserStore'
import { useTheme } from '@/hooks/useTheme'
import { calcGoalProgress, calcOverallStats } from '@/lib/progress'
import { categoryLabels } from '@/lib/constants'
import { formatDateDisplay, isOverdue, parseGoalDate } from '@/lib/dates'
import { YearSelector } from '@/components/YearSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoalCategory } from '@/types'
import { ArrowLeft, Moon, Sun, TrendingUp, Trophy, AlertTriangle, Zap, BarChart3 } from 'lucide-react'

const catColors: Record<GoalCategory, string> = {
  performance: 'bg-orange-500',
  development: 'bg-violet-500',
  organizational: 'bg-cyan-500',
}

const catTextColors: Record<GoalCategory, string> = {
  performance: 'text-orange-500',
  development: 'text-violet-500',
  organizational: 'text-cyan-500',
}

export function Analytics() {
  const navigate = useNavigate()
  const { goals, profile, currentYear, setCurrentYear, getYearsWithData } = useUserStore()
  const { theme, toggleTheme } = useTheme()

  if (!profile) return <Navigate to="/" replace />

  const stats = calcOverallStats(goals)
  const yearsWithData = getYearsWithData()

  const goalsByProgress = goals
    .map((g) => ({ goal: g, progress: calcGoalProgress(g) }))
    .sort((a, b) => b.progress.percent - a.progress.percent)

  const overdueMilestones = goals.flatMap((g) =>
    g.milestones
      .filter((m) => m.status !== 'completed' && isOverdue(m.dueDate))
      .map((m) => ({ goal: g, milestone: m }))
  )

  const completedGoals = goals.filter((g) => g.status === 'completed').length
  const avgProgress = goals.length > 0
    ? Math.round(goalsByProgress.reduce((s, gp) => s + gp.progress.percent, 0) / goals.length)
    : 0

  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}` as 'Q1' | 'Q2' | 'Q3' | 'Q4'
  const currentQuarterItems = goals.flatMap((g) => {
    const qp = g.quarterPlans.find((q) => q.quarter === currentQuarter)
    return qp ? qp.items.filter((i) => i.trim()).map((item) => ({ goalName: g.targetName, item })) : []
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Analytics
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <YearSelector currentYear={currentYear} availableYears={yearsWithData} onChange={setCurrentYear} />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No goals for {currentYear}. Create some first.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HeroCard icon={<TrendingUp className="h-5 w-5 text-primary" />} label="Avg. Progress" value={`${avgProgress}%`} />
              <HeroCard icon={<Trophy className="h-5 w-5 text-green-500" />} label="Goals Completed" value={`${completedGoals}/${stats.totalGoals}`} />
              <HeroCard icon={<Zap className="h-5 w-5 text-amber-500" />} label="Milestones Done" value={`${stats.milestonesCompleted}/${stats.milestonesTotal}`} />
              <HeroCard
                icon={<AlertTriangle className={`h-5 w-5 ${stats.overdueMilestones > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />}
                label="Overdue"
                value={String(stats.overdueMilestones)}
                danger={stats.overdueMilestones > 0}
              />
            </div>

            {/* On Track indicator */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Year Progress vs Completion</h3>
                {(() => {
                  const yearStart = new Date(currentYear, 0, 1).getTime()
                  const yearEnd = new Date(currentYear, 11, 31).getTime()
                  const now = Date.now()
                  const yearElapsed = Math.min(100, Math.max(0, Math.round(((now - yearStart) / (yearEnd - yearStart)) * 100)))
                  const diff = stats.overallPercent - yearElapsed
                  const status = diff >= 0 ? 'on-track' : diff >= -10 ? 'slightly-behind' : 'behind'
                  const statusConfig = {
                    'on-track': { label: 'On Track', color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
                    'slightly-behind': { label: 'Slightly Behind', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
                    'behind': { label: 'Behind Schedule', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
                  }
                  const cfg = statusConfig[status]
                  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                })()}
              </div>
              {(() => {
                const yearStart = new Date(currentYear, 0, 1).getTime()
                const yearEnd = new Date(currentYear, 11, 31).getTime()
                const now = Date.now()
                const yearElapsed = Math.min(100, Math.max(0, Math.round(((now - yearStart) / (yearEnd - yearStart)) * 100)))
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Year elapsed</span>
                        <span className="font-medium">{yearElapsed}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gray-400 dark:bg-gray-500 transition-all" style={{ width: `${yearElapsed}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Goals completion</span>
                        <span className="font-medium">{stats.overallPercent}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${stats.overallPercent >= yearElapsed ? 'bg-green-500' : stats.overallPercent >= yearElapsed - 10 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${stats.overallPercent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </Card>

            {/* Overall progress ring */}
            <Card className="p-6">
              <div className="flex items-center gap-8">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                      className="stroke-primary transition-all duration-700"
                      strokeDasharray={`${stats.overallPercent * 2.64} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{stats.overallPercent}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold">Year Progress</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Milestones</p>
                      <p className="font-semibold">{stats.milestonesCompleted} completed</p>
                      <p className="text-xs text-muted-foreground">{stats.milestonesInProgress} in progress, {stats.milestonesPlanned} planned</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Success Criteria</p>
                      <p className="font-semibold">{stats.criteriaChecked} of {stats.criteriaTotal} met</p>
                      <p className="text-xs text-muted-foreground">{stats.criteriaTotal > 0 ? Math.round((stats.criteriaChecked / stats.criteriaTotal) * 100) : 0}% completion</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Goals</p>
                      <p className="font-semibold">{completedGoals} of {stats.totalGoals} done</p>
                      <p className="text-xs text-muted-foreground">{stats.byStatus.active} active, {stats.byStatus.draft} draft</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Per-goal progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goal Progress Ranking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goalsByProgress.map(({ goal, progress }) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/goals/${goal.id}`)}
                  >
                    <span className={`text-xs font-bold w-10 text-right ${catTextColors[goal.category]}`}>
                      {progress.percent}%
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{goal.targetNumber}. {goal.targetName}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColors[goal.category]} text-white`}>
                          {categoryLabels[goal.category]}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${catColors[goal.category]}`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                      {progress.milestonesCompleted}/{progress.milestonesTotal} M
                      {progress.criteriaTotal > 0 && ` · ${progress.criteriaChecked}/${progress.criteriaTotal} C`}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Milestone Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Milestone Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {goals
                      .flatMap((g) => g.milestones.map((m) => ({ ...m, goalName: g.targetName, goalId: g.id, goalCategory: g.category })))
                      .sort((a, b) => {
                        const da = parseGoalDate(a.dueDate)
                        const db = parseGoalDate(b.dueDate)
                        return (da?.getTime() || 0) - (db?.getTime() || 0)
                      })
                      .map((m, i) => {
                        const overdue = m.status !== 'completed' && isOverdue(m.dueDate)
                        return (
                          <div key={`${m.goalId}-${m.id}-${i}`} className="relative pl-10">
                            <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
                              m.status === 'completed' ? 'bg-green-500' :
                              m.status === 'in_progress' ? 'bg-blue-500' :
                              overdue ? 'bg-red-500' : 'bg-muted-foreground/30'
                            }`} style={{ top: '4px' }} />
                            <div
                              className="flex items-start justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                              onClick={() => navigate(`/goals/${m.goalId}`)}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{m.id}: {m.description}</p>
                                <p className="text-xs text-muted-foreground">{m.goalName}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className={`text-xs font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                  {formatDateDisplay(m.dueDate)}
                                </p>
                                <p className={`text-[10px] ${
                                  m.status === 'completed' ? 'text-green-600' :
                                  m.status === 'in_progress' ? 'text-blue-600' :
                                  overdue ? 'text-red-500' : 'text-muted-foreground'
                                }`}>
                                  {m.status === 'completed' ? 'Done' : m.status === 'in_progress' ? 'In Progress' : overdue ? 'Overdue' : 'Planned'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Quarterly focus */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quarterly Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {stats.quarterActivity.map((qa) => {
                      const maxItems = Math.max(...stats.quarterActivity.map((q) => q.items), 1)
                      const barPct = Math.round((qa.items / maxItems) * 100)
                      const isCurrent = qa.quarter === currentQuarter
                      return (
                        <div key={qa.quarter} className="text-center">
                          <div className="h-24 flex items-end justify-center mb-1.5">
                            <div
                              className={`w-10 rounded-t transition-all duration-500 ${isCurrent ? 'bg-primary' : 'bg-primary/40'}`}
                              style={{ height: `${Math.max(barPct, 6)}%` }}
                            />
                          </div>
                          <p className={`text-xs font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                            {qa.quarter} {isCurrent && '←'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{qa.items} items</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Category breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categoryProgress.map((cp) => (
                      <div key={cp.category}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${catColors[cp.category]}`} />
                            {cp.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {cp.count} goal{cp.count !== 1 ? 's' : ''} · {cp.percent}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${catColors[cp.category]}`}
                            style={{ width: `${cp.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current quarter focus */}
            {currentQuarterItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Quarter Focus ({currentQuarter})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {currentQuarterItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-md border bg-card">
                        <span className="text-muted-foreground mt-0.5">&#8226;</span>
                        <div className="min-w-0">
                          <p>{item.item}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.goalName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overdue milestones */}
            {overdueMilestones.length > 0 && (
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Overdue Milestones ({overdueMilestones.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueMilestones.map((om, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-sm p-2 rounded-md bg-red-50 dark:bg-red-950/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                        onClick={() => navigate(`/goals/${om.goal.id}`)}
                      >
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 shrink-0 w-24">
                          {formatDateDisplay(om.milestone.dueDate)}
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium">{om.milestone.id}: {om.milestone.description}</span>
                          <p className="text-xs text-muted-foreground truncate">{om.goal.targetName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HeroCard({ icon, label, value, danger }: {
  icon: React.ReactNode
  label: string
  value: string
  danger?: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${danger ? 'text-red-500' : ''}`}>{value}</p>
        </div>
      </div>
    </Card>
  )
}
