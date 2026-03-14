import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Keyboard } from 'lucide-react'
import { shortcutsList } from '@/hooks/useKeyboardShortcuts'

export function KeyboardHelp() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {shortcutsList.map((s) => (
              <div key={s.keys} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.description}</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
