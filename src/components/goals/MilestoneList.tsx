import { Milestone, MilestoneStatus } from '@/types'
import { milestoneStatusCycle } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toInputDate, fromInputDate, formatDateDisplay, isOverdue } from '@/lib/dates'

interface MilestoneListProps {
  milestones: Milestone[]
  onStatusChange?: (id: string, status: MilestoneStatus) => void
  readonly?: boolean
  editable?: boolean
  onChange?: (milestones: Milestone[]) => void
}

const statusConfig: Record<MilestoneStatus, { icon: typeof Circle; className: string; label: string }> = {
  planned: { icon: Circle, className: 'text-muted-foreground', label: 'Planned' },
  in_progress: { icon: Clock, className: 'text-blue-600', label: 'In Progress' },
  completed: { icon: CheckCircle2, className: 'text-green-600', label: 'Completed' },
}

export function MilestoneList({ milestones, onStatusChange, readonly, editable, onChange }: MilestoneListProps) {
  const cycleStatus = (current: MilestoneStatus): MilestoneStatus => {
    const idx = milestoneStatusCycle.indexOf(current)
    return milestoneStatusCycle[(idx + 1) % milestoneStatusCycle.length]
  }

  const updateMilestone = (index: number, field: 'description' | 'dueDate', value: string) => {
    if (!onChange) return
    const updated = milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    onChange(updated)
  }

  const addMilestone = () => {
    if (!onChange) return
    const nextNum = milestones.length + 1
    onChange([
      ...milestones,
      { id: `M${nextNum}`, dueDate: '', description: '', status: 'planned' as MilestoneStatus },
    ])
  }

  const removeMilestone = (index: number) => {
    if (!onChange || milestones.length <= 1) return
    onChange(milestones.filter((_, i) => i !== index))
  }

  if (editable && onChange) {
    return (
      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-2 items-start p-3 rounded-md border bg-card">
            <span className="text-sm font-medium mt-2.5 shrink-0 w-8">{m.id}</span>
            <Input
              type="date"
              value={toInputDate(m.dueDate)}
              onChange={(e) => updateMilestone(i, 'dueDate', fromInputDate(e.target.value))}
              className="w-40 shrink-0"
            />
            <Input
              value={m.description}
              onChange={(e) => updateMilestone(i, 'description', e.target.value)}
              placeholder="Milestone description..."
            />
            {milestones.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground mt-0.5"
                onClick={() => removeMilestone(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" className="text-xs" onClick={addMilestone}>
          <Plus className="h-3 w-3 mr-1" /> Add milestone
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {milestones.map((m) => {
        const config = statusConfig[m.status]
        const Icon = config.icon
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 p-3 rounded-md border bg-card"
          >
            {!readonly && onStatusChange ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onStatusChange(m.id, cycleStatus(m.status))}
              >
                <Icon className={cn('h-5 w-5', config.className)} />
              </Button>
            ) : (
              <Icon className={cn('h-5 w-5 shrink-0', config.className)} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{m.id}</span>
                <span className={cn('text-xs text-muted-foreground', isOverdue(m.dueDate) && m.status !== 'completed' && 'text-red-600 dark:text-red-400 font-medium')}>{formatDateDisplay(m.dueDate)}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{m.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
