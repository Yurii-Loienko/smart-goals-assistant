import { useState } from 'react'
import { useUserStore } from '@/hooks/useUserStore'
import { useClaudeAPI, hasApiKey } from '@/hooks/useClaudeAPI'
import { buildAutoGenerateGoalsPrompt, buildAutoGenerateWithPreviousYearPrompt } from '@/lib/prompts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Goal, SuggestedGoal } from '@/types'
import { categoryLabels } from '@/lib/constants'
import { generateId } from '@/lib/utils'
import { Loader2, Sparkles, Check, ChevronDown, ChevronUp, KeyRound } from 'lucide-react'

interface GenerateModalProps {
  open: boolean
  onClose: () => void
}

export function GenerateModal({ open, onClose }: GenerateModalProps) {
  const { profile, currentYear, addGoals, getGoalsForYear } = useUserStore()
  const { generate, loading, error } = useClaudeAPI()
  const [extraContext, setExtraContext] = useState('')
  const [suggested, setSuggested] = useState<SuggestedGoal[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [step, setStep] = useState<'configure' | 'preview'>('configure')

  const handleGenerate = async () => {
    if (!profile) return

    const profileForPrompt = {
      ...profile,
      targetYear: currentYear,
      currentProjects: extraContext
        ? `${profile.currentProjects}. Additional context: ${extraContext}`
        : profile.currentProjects,
    }

    const previousYearGoals = getGoalsForYear(currentYear - 1)
    let prompt: string
    if (previousYearGoals.length > 0) {
      prompt = buildAutoGenerateWithPreviousYearPrompt(profileForPrompt, previousYearGoals)
    } else {
      prompt = buildAutoGenerateGoalsPrompt(profileForPrompt)
    }

    const result = await generate<SuggestedGoal[]>(prompt)
    if (result && Array.isArray(result)) {
      const withIds = result.map((g, i) => ({
        ...g,
        id: generateId(),
        targetNumber: i + 1,
        milestones: (g.milestones || []).map((m) => ({ ...m, status: 'planned' as const })),
        rawInput: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accepted: true,
      }))
      setSuggested(withIds)
      setStep('preview')
    }
  }

  const toggleGoal = (id: string) => {
    setSuggested((prev) =>
      prev.map((g) => (g.id === id ? { ...g, accepted: !g.accepted } : g))
    )
  }

  const handleAccept = () => {
    const accepted = suggested
      .filter((g) => g.accepted)
      .map(({ suggestedReason, accepted: _, ...goal }): Goal => goal)
    addGoals(accepted)
    onClose()
    setSuggested([])
    setStep('configure')
    setExtraContext('')
  }

  const handleBack = () => {
    setStep('configure')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate {currentYear} Targets
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'configure' && (
            <div className="space-y-4">
              {!hasApiKey() && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                    <KeyRound className="h-4 w-4" />
                    AI not configured
                  </div>
                  <p className="text-amber-600 dark:text-amber-500 text-xs">
                    Go to <strong>AI Settings</strong> (robot icon in the toolbar) to choose a provider.
                    Use <strong>Ollama</strong> for free offline AI, or configure a cloud provider key.
                    You can still add goals manually from the dashboard.
                  </p>
                </div>
              )}

              {hasApiKey() && profile && (
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                  <p><span className="font-medium">Role:</span> {profile.role || 'Not set'} {profile.company ? `at ${profile.company}` : ''}</p>
                  <p><span className="font-medium">Stack:</span> {profile.stack.join(', ') || 'Not set'}</p>
                  <p><span className="font-medium">Projects:</span> {profile.currentProjects || 'Not set'}</p>
                  <p><span className="font-medium">Learning:</span> {profile.learningGoals || 'Not set'}</p>
                </div>
              )}

              {hasApiKey() && getGoalsForYear(currentYear - 1).length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    {getGoalsForYear(currentYear - 1).length} goals from {currentYear - 1} will be used as context
                  </p>
                </div>
              )}

              {hasApiKey() && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Additional context (optional)
                  </label>
                  <Textarea
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                    placeholder="Any extra focus areas, new projects, or priorities for this year..."
                    rows={3}
                  />
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Select the targets you want to keep. Click to expand details.
              </p>
              {suggested.map((goal) => (
                <Card key={goal.id} className={goal.accepted ? '' : 'opacity-50'}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                      <Button
                        variant={goal.accepted ? 'default' : 'outline'}
                        size="icon"
                        className="h-6 w-6 shrink-0 mt-0.5"
                        onClick={() => toggleGoal(goal.id)}
                      >
                        {goal.accepted && <Check className="h-3 w-3" />}
                      </Button>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-medium">
                            {goal.targetNumber}. {goal.targetName}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={goal.category}>{categoryLabels[goal.category]}</Badge>
                            {expandedId === goal.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {goal.suggestedReason && (
                          <p className="text-xs text-muted-foreground mt-1">{goal.suggestedReason}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedId === goal.id && (
                    <CardContent className="px-4 pb-4 pt-0 ml-9">
                      <p className="text-sm mb-2">{goal.targetDetails}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">Success Criteria:</p>
                        <ul className="list-disc ml-4">
                          {goal.successCriteria.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t p-4 gap-2">
          {step === 'configure' && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={loading || !profile?.role || !hasApiKey()}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Targets</>
                )}
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button
                onClick={handleAccept}
                disabled={!suggested.some((g) => g.accepted)}
              >
                <Check className="h-4 w-4 mr-2" />
                Accept {suggested.filter((g) => g.accepted).length} Targets
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
