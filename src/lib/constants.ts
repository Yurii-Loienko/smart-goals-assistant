import { GoalCategory, GoalStatus, MilestoneStatus } from '@/types'

export const YEAR_RANGE_START = 2020
export const YEAR_RANGE_END = 2035
export const YEAR_SCAN_START = 2024
export const YEAR_SCAN_END = 2035

export const categoryLabels: Record<GoalCategory, string> = {
  performance: 'Performance',
  development: 'Development',
  organizational: 'Organizational',
}

export const categoryOptions: GoalCategory[] = ['performance', 'development', 'organizational']

export const statusLabels: Record<GoalStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
}

export const statusCycle: GoalStatus[] = ['draft', 'active', 'completed']

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const milestoneStatusCycle: MilestoneStatus[] = ['planned', 'in_progress', 'completed']
