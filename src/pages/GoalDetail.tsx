import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/hooks/useUserStore'
import { useClaudeAPI, hasApiKey } from '@/hooks/useClaudeAPI'
import { buildFullTargetText, buildWorkdayGoalName, buildWorkdayDescription, buildWorkdayMilestones, buildWorkdayCriteria, buildWorkdayDueDate } from '@/lib/formatters'
import { QuarterTabs } from '@/components/goals/QuarterTabs'
import { MilestoneList } from '@/components/goals/MilestoneList'
import { NotesLog } from '@/components/goals/NotesLog'
import { SuccessCriteria } from '@/components/goals/SuccessCriteria'
import { ImproveModal } from '@/components/goals/ImproveModal'
import { DiffView } from '@/components/goals/DiffView'
import { CopyButton } from '@/components/ui/CopyButton'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildImproveByCommentPrompt } from '@/lib/prompts'
import { categoryLabels, categoryOptions, statusLabels, statusCycle } from '@/lib/constants'
import { GoalCategory, GoalNote, GoalStatus, Milestone, MilestoneStatus, QuarterPlan } from '@/types'
import { toInputDate, fromInputDate, formatDateDisplay, isOverdue } from '@/lib/dates'
import { calcGoalProgress } from '@/lib/progress'
import { generateId } from '@/lib/utils'
import { ArrowLeft, MessageSquarePlus, Trash2, MessageCircle, Pencil, X, Save, Calendar, Check } from 'lucide-react'

export function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getGoal, updateGoal, deleteGoal, profile } = useUserStore()
  const { generate, loading } = useClaudeAPI()
  const [improveOpen, setImproveOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [pendingImprovement, setPendingImprovement] = useState<{
    targetDetails: string
    successCriteria: string[]
    milestones: Array<{ id: string; dueDate: string; description: string }>
  } | null>(null)

  const goal = getGoal(id || '')

  const [editName, setEditName] = useState('')
  const [editDetails, setEditDetails] = useState('')
  const [editCategory, setEditCategory] = useState<GoalCategory>('performance')
  const [editDueDate, setEditDueDate] = useState('')
  const [editQuarterPlans, setEditQuarterPlans] = useState<QuarterPlan[]>([])
  const [editCriteria, setEditCriteria] = useState<string[]>([])
  const [editMilestones, setEditMilestones] = useState<Milestone[]>([])

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Goal not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const currentStatus: GoalStatus = goal.status || 'draft'
  const goalProgress = calcGoalProgress(goal)
  const nextMilestone = goal.milestones.find((m) => m.status !== 'completed')

  const addActivityNote = (type: GoalNote['type'], text: string) => {
    const note: GoalNote = { id: generateId(), type, text, createdAt: new Date().toISOString() }
    const existing = goal.notes || []
    updateGoal(goal.id, { notes: [note, ...existing] })
  }

  const cycleGoalStatus = () => {
    const idx = statusCycle.indexOf(currentStatus)
    const next = statusCycle[(idx + 1) % statusCycle.length]
    updateGoal(goal.id, { status: next })
    addActivityNote('status_change', `Status changed: ${statusLabels[currentStatus]} → ${statusLabels[next]}`)
    toast.success(`Status changed to ${statusLabels[next]}`)
  }

  const startEditing = () => {
    setEditName(goal.targetName)
    setEditDetails(goal.targetDetails)
    setEditCategory(goal.category)
    setEditDueDate(goal.dueDate || '')
    setEditQuarterPlans(goal.quarterPlans.map((qp) => ({ ...qp, items: [...qp.items] })))
    setEditCriteria([...goal.successCriteria])
    setEditMilestones(goal.milestones.map((m) => ({ ...m })))
    setEditing(true)
  }

  const cancelEditing = () => setEditing(false)

  const saveEditing = () => {
    updateGoal(goal.id, {
      targetName: editName,
      targetDetails: editDetails,
      category: editCategory,
      dueDate: editDueDate || undefined,
      quarterPlans: editQuarterPlans,
      successCriteria: editCriteria.filter((c) => c.trim()),
      milestones: editMilestones,
    })
    setEditing(false)
    toast.success('Goal saved')
  }

  const handleMilestoneStatusChange = (milestoneId: string, status: MilestoneStatus) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status } : m
    )
    updateGoal(goal.id, { milestones: updatedMilestones })
  }

  const handleCriteriaToggle = (index: number) => {
    const current = goal.checkedCriteria || []
    const next = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index]
    updateGoal(goal.id, { checkedCriteria: next })
  }

  const handleImprove = async (comment: string) => {
    addActivityNote('em_feedback', comment)

    const prompt = buildImproveByCommentPrompt(goal, comment)
    const result = await generate<{
      targetDetails: string
      successCriteria: string[]
      milestones: Array<{ id: string; dueDate: string; description: string }>
    }>(prompt)

    if (result) {
      setPendingImprovement(result)
    }
    setImproveOpen(false)
  }

  const applyImprovement = () => {
    if (!pendingImprovement) return
    updateGoal(goal.id, {
      targetDetails: pendingImprovement.targetDetails,
      successCriteria: pendingImprovement.successCriteria,
      milestones: pendingImprovement.milestones.map((m, idx) => ({
        ...m,
        status: goal.milestones[idx]?.status || 'planned',
      })),
    })
    addActivityNote('ai_applied', 'AI improvement applied: target details, success criteria, and milestones updated based on manager feedback.')
    setPendingImprovement(null)
    toast.success('Goal improved by AI')
  }

  const handleDelete = () => {
    toast(`Delete "${goal.targetName}"?`, {
      action: {
        label: 'Delete',
        onClick: () => {
          deleteGoal(goal.id)
          toast.success('Goal deleted')
          navigate('/dashboard')
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className={`max-w-3xl mx-auto p-4 sm:p-6 transition-all ${chatOpen ? 'sm:mr-96' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEditing}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </>
            ) : (
              <>
                <CopyButton text={buildFullTargetText(goal)} />
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Title + badges */}
        <div className="mb-6">
          {editing ? (
            <div className="space-y-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-semibold"
                placeholder="Goal name..."
              />
              <div className="flex gap-2 flex-wrap">
                {categoryOptions.map((cat) => (
                  <Button
                    key={cat}
                    variant={editCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditCategory(cat)}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Due Date</label>
                <Input
                  type="date"
                  value={toInputDate(editDueDate)}
                  onChange={(e) => setEditDueDate(fromInputDate(e.target.value))}
                  className="w-48"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-xl font-bold">
                  {goal.targetNumber}. {goal.targetName}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={goal.category}>{categoryLabels[goal.category]}</Badge>
                <Badge
                  variant={currentStatus}
                  className="cursor-pointer"
                  onClick={cycleGoalStatus}
                  title="Click to change status"
                >
                  {statusLabels[currentStatus]}
                </Badge>
                {goal.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDateDisplay(goal.dueDate!)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Progress summary */}
        {!editing && (
          <Card className="mb-6 p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-muted" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="10"
                    className={`transition-all duration-700 ${goalProgress.percent === 100 ? 'stroke-green-500' : 'stroke-primary'}`}
                    strokeDasharray={`${goalProgress.percent * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{goalProgress.percent}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{goalProgress.milestonesCompleted}</span>/{goalProgress.milestonesTotal} milestones
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{goalProgress.criteriaChecked}</span>/{goalProgress.criteriaTotal} criteria
                  </span>
                </div>
                {nextMilestone && (
                  <div className={`text-sm ${isOverdue(nextMilestone.dueDate) ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                    Next: <span className="font-medium text-foreground">{nextMilestone.id}</span> — {nextMilestone.description.substring(0, 60)}{nextMilestone.description.length > 60 ? '...' : ''}
                    <span className="ml-2 text-xs">({formatDateDisplay(nextMilestone.dueDate)})</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {pendingImprovement && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Proposed AI Improvements</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={applyImprovement}>
                    <Check className="h-4 w-4 mr-1" /> Apply Changes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPendingImprovement(null)}>
                    <X className="h-4 w-4 mr-1" /> Discard
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DiffView
                sections={[
                  {
                    label: 'Target Details',
                    oldValue: goal.targetDetails,
                    newValue: pendingImprovement.targetDetails,
                  },
                  {
                    label: 'Success Criteria',
                    oldValue: goal.successCriteria.map((c) => `\u2022 ${c}`).join('\n'),
                    newValue: pendingImprovement.successCriteria.map((c) => `\u2022 ${c}`).join('\n'),
                  },
                  {
                    label: 'Milestones',
                    oldValue: goal.milestones.map((m) => `${m.id} (${m.dueDate}): ${m.description}`).join('\n'),
                    newValue: pendingImprovement.milestones.map((m) => `${m.id} (${m.dueDate}): ${m.description}`).join('\n'),
                  },
                ]}
              />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-5 mb-4">
            <TabsTrigger value="details" className="shrink-0">Details</TabsTrigger>
            <TabsTrigger value="quarterly" className="shrink-0">Quarterly</TabsTrigger>
            <TabsTrigger value="criteria" className="shrink-0">Criteria</TabsTrigger>
            <TabsTrigger value="milestones" className="shrink-0">Milestones</TabsTrigger>
            <TabsTrigger value="notes" className="shrink-0">Activity</TabsTrigger>
          </TabsList>

          {/* Tab: Target Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Description</CardTitle>
                  {!editing && <CopyButton text={goal.targetDetails} />}
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={6}
                    placeholder="Detailed SMART description..."
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line">{goal.targetDetails}</p>
                )}
              </CardContent>
            </Card>

            {!editing && (
              <div className="flex gap-3 mt-4">
                {hasApiKey() && (
                  <>
                    <Button className="flex-1" variant="outline" onClick={() => setImproveOpen(true)}>
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      Improve by EM Comment
                    </Button>
                    <Button variant="outline" onClick={() => setChatOpen(!chatOpen)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      AI Chat
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab: Quarterly Plan */}
          <TabsContent value="quarterly">
            <Card>
              <CardContent className="pt-6">
                <QuarterTabs
                  quarterPlans={editing ? editQuarterPlans : goal.quarterPlans}
                  editable={editing}
                  onChange={setEditQuarterPlans}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Success Criteria */}
          <TabsContent value="criteria">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Success Criteria ({goal.successCriteria.length})
                  </CardTitle>
                  {!editing && (
                    <CopyButton text={goal.successCriteria.map((c) => `- ${c}`).join('\n')} />
                  )}
                </div>
                {!editing && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${goalProgress.criteriaTotal > 0 ? Math.round((goalProgress.criteriaChecked / goalProgress.criteriaTotal) * 100) : 0}%` }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <SuccessCriteria
                  criteria={editing ? editCriteria : goal.successCriteria}
                  interactive={!editing}
                  checkedIndices={goal.checkedCriteria || []}
                  onToggle={handleCriteriaToggle}
                  editable={editing}
                  onChange={setEditCriteria}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Milestones */}
          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Milestones ({(editing ? editMilestones : goal.milestones).length})
                  </CardTitle>
                  {!editing && (
                    <CopyButton
                      text={goal.milestones
                        .map((m) => `${m.id} (${m.dueDate}): ${m.description}`)
                        .join('\n')}
                    />
                  )}
                </div>
                {!editing && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${goalProgress.milestonesTotal > 0 ? Math.round((goalProgress.milestonesCompleted / goalProgress.milestonesTotal) * 100) : 0}%` }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <MilestoneList
                  milestones={editing ? editMilestones : goal.milestones}
                  onStatusChange={editing ? undefined : handleMilestoneStatusChange}
                  editable={editing}
                  onChange={setEditMilestones}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notes */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Activity Log ({(goal.notes || []).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotesLog
                  notes={goal.notes || []}
                  onChange={(notes) => updateGoal(goal.id, { notes })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Workday Export */}
        {!editing && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Copy for Workday</CardTitle>
              <p className="text-xs text-muted-foreground">Copy each field separately to paste into Workday</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Goal Name', value: buildWorkdayGoalName(goal) },
                { label: 'Description', value: buildWorkdayDescription(goal) },
                { label: 'Due Date', value: buildWorkdayDueDate(goal) },
                { label: 'Success Criteria', value: buildWorkdayCriteria(goal) },
                { label: 'Milestones', value: buildWorkdayMilestones(goal) },
              ].filter((f) => f.value).map((field) => (
                <div key={field.label} className="flex items-center gap-2 group">
                  <span className="text-xs font-medium w-20 sm:w-28 shrink-0 text-muted-foreground">{field.label}</span>
                  <div className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate font-mono">
                    {field.value.split('\n')[0]}{field.value.includes('\n') ? '...' : ''}
                  </div>
                  <CopyButton text={field.value} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <ImproveModal
        open={improveOpen}
        onClose={() => setImproveOpen(false)}
        onImprove={handleImprove}
        loading={loading}
      />

      <ChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        profile={profile}
        currentGoal={goal}
        mode="improve"
      />
    </div>
  )
}
