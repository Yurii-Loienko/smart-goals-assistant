import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/hooks/useUserStore'
import { useClaudeAPI, hasApiKey } from '@/hooks/useClaudeAPI'
import { buildSingleGoalPrompt } from '@/lib/prompts'
import { goalTemplates, GoalTemplate } from '@/lib/templates'
import { generateId } from '@/lib/utils'
import { toInputDate, fromInputDate } from '@/lib/dates'
import { Goal, GoalCategory, QuarterPlan, Milestone, MilestoneStatus } from '@/types'
import { categoryLabels } from '@/lib/constants'
import { QuarterTabs } from '@/components/goals/QuarterTabs'
import { MilestoneList } from '@/components/goals/MilestoneList'
import { SuccessCriteria } from '@/components/goals/SuccessCriteria'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Sparkles, LayoutTemplate } from 'lucide-react'

interface GeneratedGoal {
  targetName: string
  targetDetails: string
  quarterPlans: QuarterPlan[]
  successCriteria: string[]
  milestones: Milestone[]
}

const defaultQuarterPlans: QuarterPlan[] = [
  { quarter: 'Q1', items: [''] },
  { quarter: 'Q2', items: [''] },
  { quarter: 'Q3', items: [''] },
  { quarter: 'Q4', items: [''] },
]

const defaultMilestones: Milestone[] = [
  { id: 'M1', dueDate: '', description: '', status: 'planned' },
  { id: 'M2', dueDate: '', description: '', status: 'planned' },
  { id: 'M3', dueDate: '', description: '', status: 'planned' },
  { id: 'M4', dueDate: '', description: '', status: 'planned' },
]

type Mode = 'manual' | 'ai' | 'template'

export function NewGoal() {
  const navigate = useNavigate()
  const { addGoal, goals, profile, currentYear } = useUserStore()
  const { generate, loading, error } = useClaudeAPI()

  const [mode, setMode] = useState<Mode>(hasApiKey() ? 'ai' : 'manual')
  const [rawInput, setRawInput] = useState('')
  const [category, setCategory] = useState<GoalCategory>('performance')
  const [generated, setGenerated] = useState<GeneratedGoal | null>(null)

  const [targetName, setTargetName] = useState('')
  const [targetDetails, setTargetDetails] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [successCriteria, setSuccessCriteria] = useState<string[]>([''])
  const [quarterPlans, setQuarterPlans] = useState<QuarterPlan[]>(defaultQuarterPlans)
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones)

  const handleGenerate = async () => {
    const prompt = buildSingleGoalPrompt(rawInput, category, profile || {}, currentYear)
    const result = await generate<GeneratedGoal>(prompt)
    if (result) {
      setGenerated(result)
    }
  }

  const handleSaveAI = () => {
    if (!generated) return
    const goal: Goal = {
      id: generateId(),
      targetNumber: goals.length + 1,
      targetName: generated.targetName,
      targetDetails: generated.targetDetails,
      category,
      quarterPlans: generated.quarterPlans,
      successCriteria: generated.successCriteria,
      milestones: generated.milestones.map((m) => ({
        ...m,
        status: 'planned' as MilestoneStatus,
      })),
      rawInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    }
    addGoal(goal)
    toast.success('Goal created!')
    navigate('/dashboard')
  }

  const handleSaveManual = () => {
    if (!targetName.trim()) return
    const goal: Goal = {
      id: generateId(),
      targetNumber: goals.length + 1,
      targetName: targetName.trim(),
      targetDetails: targetDetails.trim(),
      category,
      quarterPlans: quarterPlans.map((qp) => ({
        ...qp,
        items: qp.items.filter((item) => item.trim()),
      })),
      successCriteria: successCriteria.filter((c) => c.trim()),
      milestones: milestones
        .filter((m) => m.description.trim())
        .map((m) => ({ ...m, status: 'planned' as MilestoneStatus })),
      rawInput: '',
      dueDate: dueDate.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    }
    addGoal(goal)
    toast.success('Goal created!')
    navigate('/dashboard')
  }

  const applyTemplate = (template: GoalTemplate) => {
    setTargetName(template.targetName)
    setTargetDetails(template.targetDetails)
    setCategory(template.category)
    setQuarterPlans(template.quarterPlans.map((qp) => ({ ...qp, items: [...qp.items] })))
    setSuccessCriteria([...template.successCriteria])
    setMilestones(template.milestones.map((m) => ({ ...m })))
    setMode('manual')
    toast.info(`Template "${template.name}" applied — customize as needed`)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-semibold">Create New Goal</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('manual')}
          >
            Manual
          </Button>
          <Button
            variant={mode === 'template' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('template')}
          >
            <LayoutTemplate className="h-4 w-4 mr-1" /> Template
          </Button>
          {hasApiKey() && (
            <Button
              variant={mode === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('ai')}
            >
              <Sparkles className="h-4 w-4 mr-1" /> AI-Assisted
            </Button>
          )}
        </div>

        {mode === 'template' && (
          <div className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground">Pick a template to pre-fill the form, then customize it.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {goalTemplates.map((template, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <Badge variant={template.category} className="text-[10px] shrink-0">
                        {categoryLabels[template.category]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {mode === 'ai' && (
          <>
            <Card className="mb-4">
              <CardContent className="pt-4">
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="performance">Performance</option>
                  <option value="development">Development</option>
                  <option value="organizational">Organizational</option>
                </select>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Describe your goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Describe your goal in plain language, e.g. 'Learn Kubernetes and get certified'"
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!rawInput.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate SMART Target
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
            </Card>

            {generated && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{generated.targetName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{generated.targetDetails}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Quarterly Plan</CardTitle></CardHeader>
                  <CardContent><QuarterTabs quarterPlans={generated.quarterPlans} /></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Success Criteria</CardTitle></CardHeader>
                  <CardContent><SuccessCriteria criteria={generated.successCriteria} /></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
                  <CardContent>
                    <MilestoneList
                      milestones={generated.milestones.map((m) => ({ ...m, status: 'planned' as MilestoneStatus }))}
                      readonly
                    />
                  </CardContent>
                </Card>
                <Button onClick={handleSaveAI} className="w-full" size="lg">
                  Save Goal to Dashboard
                </Button>
              </div>
            )}
          </>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="performance">Performance</option>
                  <option value="development">Development</option>
                  <option value="organizational">Organizational</option>
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Name *</label>
                  <Input
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="e.g. Improve system reliability to 99.9% uptime"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Details / Description</label>
                  <Textarea
                    value={targetDetails}
                    onChange={(e) => setTargetDetails(e.target.value)}
                    placeholder="Detailed SMART description of the target..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Due Date</label>
                  <Input
                    type="date"
                    value={toInputDate(dueDate)}
                    onChange={(e) => setDueDate(fromInputDate(e.target.value))}
                    className="w-48"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quarterly Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <QuarterTabs
                  quarterPlans={quarterPlans}
                  editable
                  onChange={setQuarterPlans}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Success Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <SuccessCriteria
                  criteria={successCriteria}
                  editable
                  onChange={setSuccessCriteria}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <MilestoneList
                  milestones={milestones}
                  editable
                  onChange={setMilestones}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleSaveManual}
              className="w-full"
              size="lg"
              disabled={!targetName.trim()}
            >
              Save Goal to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
