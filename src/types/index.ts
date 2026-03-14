export type GoalCategory = 'performance' | 'development' | 'organizational'
export type MilestoneStatus = 'planned' | 'in_progress' | 'completed'
export type GoalStatus = 'draft' | 'active' | 'completed'
export type ChatRole = 'assistant' | 'user'
export type ChatMode = 'generate' | 'improve' | 'general'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  company: string
  stack: string[]
  currentProjects: string
  learningGoals: string
  teamGoals: string
  createdAt: string
  updatedAt: string
}

export interface QuarterPlan {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  items: string[]
}

export interface Milestone {
  id: string
  dueDate: string
  description: string
  status: MilestoneStatus
}

export type GoalNoteType = 'note' | 'em_feedback' | 'ai_applied' | 'status_change'

export interface GoalNote {
  id: string
  type: GoalNoteType
  text: string
  createdAt: string
}

export interface Goal {
  id: string
  targetNumber: number
  targetName: string
  targetDetails: string
  category: GoalCategory
  quarterPlans: QuarterPlan[]
  successCriteria: string[]
  milestones: Milestone[]
  rawInput: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  checkedCriteria?: number[]
  status?: GoalStatus
  notes?: GoalNote[]
}

export interface SuggestedGoal extends Goal {
  suggestedReason?: string
  accepted?: boolean
}

export interface YearWorkspace {
  year: number
  goals: Goal[]
  createdAt: string
}

export interface ExportData {
  version: 1
  exportedAt: string
  profile: UserProfile
  workspaces: YearWorkspace[]
}
