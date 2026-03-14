import { useState, useRef, DragEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useUserStore } from '@/hooks/useUserStore'
import { useTheme } from '@/hooks/useTheme'
import { calcGoalProgress } from '@/lib/progress'
import { categoryLabels, statusLabels } from '@/lib/constants'
import { formatDateDisplay, isOverdue } from '@/lib/dates'
import { YearSelector } from '@/components/YearSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Goal, GoalStatus } from '@/types'
import {
  ArrowLeft,
  Moon,
  Sun,
  Kanban,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  GripVertical,
} from 'lucide-react'

const COLUMNS: { status: GoalStatus; label: string; accent: string; bg: string; dropHighlight: string }[] = [
  { status: 'draft', label: 'Draft', accent: 'border-t-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40', dropHighlight: 'ring-2 ring-slate-400 bg-slate-100 dark:bg-slate-800/60' },
  { status: 'active', label: 'Active', accent: 'border-t-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20', dropHighlight: 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/40' },
  { status: 'completed', label: 'Completed', accent: 'border-t-green-500', bg: 'bg-green-50/50 dark:bg-green-950/20', dropHighlight: 'ring-2 ring-green-500 bg-green-100 dark:bg-green-900/40' },
]

const statusFlow: GoalStatus[] = ['draft', 'active', 'completed']

function MilestonePipeline({ goal }: { goal: Goal }) {
  if (goal.milestones.length === 0) return null
  return (
    <div className="flex items-center gap-0.5">
      {goal.milestones.map((m, i) => (
        <div key={m.id} className="flex items-center">
          {m.status === 'completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : m.status === 'in_progress' ? (
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
          )}
          {i < goal.milestones.length - 1 && (
            <div className={`w-3 h-0.5 ${
              m.status === 'completed' ? 'bg-green-400 dark:bg-green-600' : 'bg-muted-foreground/20'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

function BoardCard({
  goal,
  onMove,
  onClick,
  onDragStart,
}: {
  goal: Goal
  onMove: (goalId: string, direction: 'forward' | 'backward') => void
  onClick: () => void
  onDragStart: (e: DragEvent, goalId: string) => void
}) {
  const progress = calcGoalProgress(goal)
  const status: GoalStatus = goal.status || 'draft'
  const idx = statusFlow.indexOf(status)
  const canForward = idx < statusFlow.length - 1
  const canBackward = idx > 0

  const effectiveDueDate = goal.dueDate
    || (goal.milestones.length > 0 ? goal.milestones[goal.milestones.length - 1].dueDate : '')
  const overdue = effectiveDueDate ? isOverdue(effectiveDueDate) : false

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, goal.id)}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-medium text-muted-foreground">
                #{goal.targetNumber}
              </p>
            </div>
            <p className="text-sm font-semibold leading-tight line-clamp-2">
              {goal.targetName}
            </p>
          </div>
          <Badge variant={goal.category} className="shrink-0 text-[10px]">
            {categoryLabels[goal.category]}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {goal.targetDetails}
        </p>

        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">
              {progress.milestonesCompleted}/{progress.milestonesTotal} milestones
            </span>
            <span className="font-semibold">{progress.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress.percent === 100 ? 'bg-green-500' :
                progress.percent > 50 ? 'bg-blue-500' :
                progress.percent > 0 ? 'bg-amber-500' :
                'bg-muted'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <MilestonePipeline goal={goal} />
          {effectiveDueDate && (
            <span className={`flex items-center gap-1 text-[11px] ${
              overdue && status !== 'completed'
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-muted-foreground'
            }`}>
              {overdue && status !== 'completed' && <AlertTriangle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              {formatDateDisplay(effectiveDueDate)}
            </span>
          )}
        </div>

        <div
          className="flex items-center justify-between pt-1 border-t opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2"
            disabled={!canBackward}
            onClick={() => onMove(goal.id, 'backward')}
          >
            <ChevronLeft className="h-3 w-3 mr-0.5" />
            {canBackward && statusLabels[statusFlow[idx - 1]]}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2"
            disabled={!canForward}
            onClick={() => onMove(goal.id, 'forward')}
          >
            {canForward && statusLabels[statusFlow[idx + 1]]}
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function TargetBoard() {
  const navigate = useNavigate()
  const { goals, profile, currentYear, setCurrentYear, getYearsWithData, updateGoal } = useUserStore()
  const { theme, toggleTheme } = useTheme()
  const [dropTarget, setDropTarget] = useState<GoalStatus | null>(null)
  const dragGoalId = useRef<string | null>(null)

  if (!profile) return <Navigate to="/" replace />

  const yearsWithData = getYearsWithData()

  const columns = COLUMNS.map((col) => ({
    ...col,
    goals: goals
      .filter((g) => (g.status || 'draft') === col.status)
      .sort((a, b) => a.targetNumber - b.targetNumber),
  }))

  const handleMove = (goalId: string, direction: 'forward' | 'backward') => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const current = goal.status || 'draft'
    const idx = statusFlow.indexOf(current)
    const nextIdx = direction === 'forward' ? idx + 1 : idx - 1
    if (nextIdx < 0 || nextIdx >= statusFlow.length) return
    updateGoal(goalId, { status: statusFlow[nextIdx] })
  }

  const handleDragStart = (e: DragEvent, goalId: string) => {
    dragGoalId.current = goalId
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: DragEvent) => {
    dragGoalId.current = null
    setDropTarget(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: DragEvent, status: GoalStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dropTarget !== status) setDropTarget(status)
  }

  const handleDragLeave = (e: DragEvent, status: GoalStatus) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const { clientX, clientY } = e
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      if (dropTarget === status) setDropTarget(null)
    }
  }

  const handleDrop = (e: DragEvent, targetStatus: GoalStatus) => {
    e.preventDefault()
    setDropTarget(null)
    const goalId = dragGoalId.current
    if (!goalId) return
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const currentStatus = goal.status || 'draft'
    if (currentStatus !== targetStatus) {
      updateGoal(goalId, { status: targetStatus })
    }
    dragGoalId.current = null
  }

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + calcGoalProgress(g).percent, 0) / goals.length)
    : 0

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <YearSelector
              currentYear={currentYear}
              availableYears={yearsWithData}
              onChange={setCurrentYear}
            />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Kanban className="h-6 w-6" /> Target Board
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{goals.length} targets</span>
            <span className="text-xs">|</span>
            <span>Overall: <span className="font-semibold text-foreground">{totalProgress}%</span></span>
          </div>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Kanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg mb-2">No targets yet</p>
              <p className="text-sm mb-4">Create goals from the Dashboard to see them here on the board.</p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onDragEnd={handleDragEnd}>
            {columns.map((col) => (
              <div
                key={col.status}
                className={`rounded-xl border-t-4 ${col.accent} p-3 min-h-[300px] transition-all duration-200 ${
                  dropTarget === col.status ? col.dropHighlight : col.bg
                }`}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={(e) => handleDragLeave(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-semibold text-sm">{col.label}</h2>
                  <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5 font-medium">
                    {col.goals.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {col.goals.map((goal) => (
                    <BoardCard
                      key={goal.id}
                      goal={goal}
                      onMove={handleMove}
                      onDragStart={handleDragStart}
                      onClick={() => navigate(`/goals/${goal.id}`)}
                    />
                  ))}
                  {col.goals.length === 0 && (
                    <div className={`text-center py-8 text-xs italic border-2 border-dashed rounded-lg ${
                      dropTarget === col.status
                        ? 'border-primary/40 text-muted-foreground'
                        : 'border-transparent text-muted-foreground/60'
                    }`}>
                      {dropTarget === col.status ? 'Drop here' : 'No targets'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
