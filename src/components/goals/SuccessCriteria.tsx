import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SuccessCriteriaProps {
  criteria: string[]
  interactive?: boolean
  checkedIndices?: number[]
  onToggle?: (index: number) => void
  editable?: boolean
  onChange?: (criteria: string[]) => void
}

export function SuccessCriteria({
  criteria,
  interactive = false,
  checkedIndices = [],
  onToggle,
  editable,
  onChange,
}: SuccessCriteriaProps) {
  const checkedSet = new Set(checkedIndices)

  const handleToggle = (idx: number) => {
    if (onToggle) {
      onToggle(idx)
    }
  }

  if (editable && onChange) {
    return (
      <div className="space-y-2">
        {criteria.map((criterion, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={criterion}
              onChange={(e) => {
                const updated = criteria.map((c, i) => (i === idx ? e.target.value : c))
                onChange(updated)
              }}
              placeholder="Measurable success criterion..."
            />
            {criteria.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => onChange(criteria.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => onChange([...criteria, ''])}
        >
          <Plus className="h-3 w-3 mr-1" /> Add criterion
        </Button>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {criteria.map((criterion, idx) => (
        <li
          key={idx}
          className={`flex items-start gap-2 text-sm ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && handleToggle(idx)}
        >
          {interactive ? (
            checkedSet.has(idx) ? (
              <CheckSquare className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            ) : (
              <Square className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            )
          ) : (
            <span className="text-muted-foreground mt-0.5">&#8226;</span>
          )}
          <span className={checkedSet.has(idx) ? 'line-through text-muted-foreground' : ''}>
            {criterion}
          </span>
        </li>
      ))}
    </ul>
  )
}
