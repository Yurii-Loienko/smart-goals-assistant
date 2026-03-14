import { useState } from 'react'
import { GoalNote, GoalNoteType } from '@/types'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, StickyNote, MessageSquare, Sparkles, ArrowRightLeft } from 'lucide-react'

interface NotesLogProps {
  notes: GoalNote[]
  onChange: (notes: GoalNote[]) => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const noteTypeConfig: Record<GoalNoteType, {
  icon: typeof StickyNote
  label: string
  borderClass: string
  iconClass: string
  bgClass: string
}> = {
  note: {
    icon: StickyNote,
    label: 'Note',
    borderClass: 'border-l-muted-foreground/30',
    iconClass: 'text-muted-foreground',
    bgClass: '',
  },
  em_feedback: {
    icon: MessageSquare,
    label: 'Manager Feedback',
    borderClass: 'border-l-amber-500',
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
  },
  ai_applied: {
    icon: Sparkles,
    label: 'AI Improvement Applied',
    borderClass: 'border-l-violet-500',
    iconClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/20',
  },
  status_change: {
    icon: ArrowRightLeft,
    label: 'Status Change',
    borderClass: 'border-l-blue-500',
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
  },
}

export function NotesLog({ notes, onChange }: NotesLogProps) {
  const [text, setText] = useState('')

  const addNote = () => {
    if (!text.trim()) return
    const note: GoalNote = {
      id: generateId(),
      type: 'note',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    onChange([note, ...notes])
    setText('')
  }

  const removeNote = (id: string) => {
    onChange(notes.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a progress note..."
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              addNote()
            }
          }}
        />
        <Button
          size="sm"
          className="shrink-0 self-end"
          disabled={!text.trim()}
          onClick={addNote}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No activity yet. Notes, EM feedback, and AI improvements will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const config = noteTypeConfig[note.type || 'note']
            const Icon = config.icon
            return (
              <div
                key={note.id}
                className={`group flex items-start gap-3 p-3 rounded-md border border-l-4 ${config.borderClass} ${config.bgClass}`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.iconClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-medium ${config.iconClass}`}>{config.label}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(note.createdAt)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{note.text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                  onClick={() => removeNote(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
