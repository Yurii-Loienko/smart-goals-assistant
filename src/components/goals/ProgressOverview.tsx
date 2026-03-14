import { Goal, GoalStatus } from '@/types'
import { calcOverallStats } from '@/lib/progress'
import { formatDateDisplay } from '@/lib/dates'
import { Card } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock, Target, TrendingUp, Calendar } from 'lucide-react'

interface ProgressOverviewProps {
  goals: Goal[]
}

const statusColors: Record<GoalStatus, string> = {
  draft: 'bg-gray-400',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
}

export function ProgressOverview({ goals }: ProgressOverviewProps) {
  if (goals.length === 0) return null

  const stats = calcOverallStats(goals)
  const criteriaPct = stats.criteriaTotal > 0 ? Math.round((stats.criteriaChecked / stats.criteriaTotal) * 100) : 0
  const milestonesPct = stats.milestonesTotal > 0 ? Math.round((stats.milestonesCompleted / stats.milestonesTotal) * 100) : 0

  return (
    <div className="space-y-4 mb-6">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Overall Progress</span>
          </div>
          <span className="text-2xl font-bold">{stats.overallPercent}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${stats.overallPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            icon={<Target className="h-4 w-4 text-blue-500" />}
            label="Goals"
            value={stats.totalGoals}
          />
          <StatBox
            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            label="Milestones Done"
            value={`${stats.milestonesCompleted}/${stats.milestonesTotal}`}
            sub={`${milestonesPct}%`}
          />
          <StatBox
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            label="Criteria Met"
            value={`${stats.criteriaChecked}/${stats.criteriaTotal}`}
            sub={`${criteriaPct}%`}
          />
          <StatBox
            icon={<AlertTriangle className={`h-4 w-4 ${stats.overdueMilestones > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />}
            label="Overdue"
            value={stats.overdueMilestones}
            danger={stats.overdueMilestones > 0}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">STATUS BREAKDOWN</p>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted mb-3">
            {stats.byStatus.completed > 0 && (
              <div className={`${statusColors.completed} transition-all`} style={{ width: `${(stats.byStatus.completed / stats.totalGoals) * 100}%` }} />
            )}
            {stats.byStatus.active > 0 && (
              <div className={`${statusColors.active} transition-all`} style={{ width: `${(stats.byStatus.active / stats.totalGoals) * 100}%` }} />
            )}
            {stats.byStatus.draft > 0 && (
              <div className={`${statusColors.draft} transition-all`} style={{ width: `${(stats.byStatus.draft / stats.totalGoals) * 100}%` }} />
            )}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed ({stats.byStatus.completed})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Active ({stats.byStatus.active})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" /> Draft ({stats.byStatus.draft})</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">CATEGORY PROGRESS</p>
          <div className="space-y-2.5">
            {stats.categoryProgress.map((cp) => (
              cp.count > 0 && (
                <div key={cp.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{cp.label} ({cp.count})</span>
                    <span className="font-semibold">{cp.percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cp.category === 'performance' ? 'bg-orange-500' :
                        cp.category === 'development' ? 'bg-violet-500' :
                        'bg-cyan-500'
                      }`}
                      style={{ width: `${cp.percent}%` }}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        </Card>
      </div>

      {stats.upcomingMilestones.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-muted-foreground">UPCOMING MILESTONES (next 30 days)</p>
          </div>
          <div className="space-y-2">
            {stats.upcomingMilestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-24">
                  <Calendar className="h-3 w-3" />
                  {formatDateDisplay(m.dueDate)}
                </span>
                <div className="min-w-0">
                  <span className="font-medium">{m.milestoneId}</span>
                  <span className="text-muted-foreground"> — {m.description}</span>
                  <p className="text-xs text-muted-foreground truncate">{m.goalName}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">QUARTERLY WORKLOAD</p>
        <div className="grid grid-cols-4 gap-3">
          {stats.quarterActivity.map((qa) => {
            const maxItems = Math.max(...stats.quarterActivity.map((q) => q.items), 1)
            const barPct = Math.round((qa.items / maxItems) * 100)
            return (
              <div key={qa.quarter} className="text-center">
                <div className="h-16 flex items-end justify-center mb-1">
                  <div
                    className="w-8 rounded-t bg-primary/80 transition-all duration-500"
                    style={{ height: `${Math.max(barPct, 4)}%` }}
                  />
                </div>
                <p className="text-xs font-semibold">{qa.quarter}</p>
                <p className="text-[10px] text-muted-foreground">{qa.items} items</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function StatBox({ icon, label, value, sub, danger }: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  danger?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold leading-tight ${danger ? 'text-red-500' : ''}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}
