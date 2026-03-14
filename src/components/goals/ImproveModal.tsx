import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface ImproveModalProps {
  open: boolean
  onClose: () => void
  onImprove: (comment: string) => Promise<void>
  loading?: boolean
}

export function ImproveModal({ open, onClose, onImprove, loading }: ImproveModalProps) {
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (!comment.trim()) return
    await onImprove(comment.trim())
    setComment('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Improve with EM Feedback</DialogTitle>
          <DialogDescription>
            Paste your engineering manager's comment and the AI will refine this target
            to address their feedback.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Paste manager's feedback here..."
          className="min-h-[120px]"
          disabled={loading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!comment.trim() || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Improve Target
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
