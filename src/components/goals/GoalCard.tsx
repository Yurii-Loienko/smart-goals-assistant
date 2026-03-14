import { Goal, GoalStatus } from '@/types'
import { categoryLabels, statusLabels } from '@/lib/constants'
import { formatDateDisplay } from '@/lib/dates'
import { calcGoalProgress } from '@/lib/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react'

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const status: GoalStatus = goal.status || 'draft'
  const progress = calcGoalProgress(goal)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {goal.targetNumber}. {goal.targetName}
          </CardTitle>
          <div className="flex gap-1.5 shrink-0">
            <Badge variant={status}>{statusLabels[status]}</Badge>
            <Badge variant={goal.category}>{categoryLabels[goal.category]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {goal.targetDetails}
        </p>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {progress.milestonesCompleted}/{progress.milestonesTotal} milestones
              {progress.criteriaTotal > 0 && ` · ${progress.criteriaChecked}/${progress.criteriaTotal} criteria`}
            </span>
            <span className="font-semibold">{progress.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress.percent === 100 ? 'bg-green-500' :
                progress.percent > 50 ? 'bg-primary' :
                progress.percent > 0 ? 'bg-amber-500' :
                'bg-muted'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {goal.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> {formatDateDisplay(goal.dueDate)}
            </span>
          )}
          <div className="flex items-center gap-1">
            {goal.milestones.map((m) => (
              <div key={m.id} title={`${m.id}: ${m.description}`}>
                {m.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                ) : m.status === 'in_progress' ? (
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
