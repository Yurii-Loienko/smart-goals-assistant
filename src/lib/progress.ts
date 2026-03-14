import { Goal, GoalCategory, GoalStatus } from '@/types'
import { parseGoalDate } from '@/lib/dates'

export interface GoalProgress {
  milestonesTotal: number
  milestonesCompleted: number
  milestonesInProgress: number
  criteriaTotal: number
  criteriaChecked: number
  percent: number
}

export function calcGoalProgress(goal: Goal): GoalProgress {
  const milestonesTotal = goal.milestones.length
  const milestonesCompleted = goal.milestones.filter((m) => m.status === 'completed').length
  const milestonesInProgress = goal.milestones.filter((m) => m.status === 'in_progress').length
  const criteriaTotal = goal.successCriteria.length
  const criteriaChecked = goal.checkedCriteria?.length || 0

  const totalWeight = milestonesTotal + criteriaTotal
  const doneWeight = milestonesCompleted + criteriaChecked
  const percent = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0

  return { milestonesTotal, milestonesCompleted, milestonesInProgress, criteriaTotal, criteriaChecked, percent }
}

export interface OverallStats {
  totalGoals: number
  byStatus: Record<GoalStatus, number>
  byCategory: Record<GoalCategory, number>
  milestonesTotal: number
  milestonesCompleted: number
  milestonesInProgress: number
  milestonesPlanned: number
  criteriaTotal: number
  criteriaChecked: number
  overdueMilestones: number
  upcomingMilestones: { goalName: string; milestoneId: string; dueDate: string; description: string }[]
  overallPercent: number
  categoryProgress: { category: GoalCategory; label: string; percent: number; count: number }[]
  quarterActivity: { quarter: string; items: number }[]
}

export function calcOverallStats(goals: Goal[]): OverallStats {
  const byStatus: Record<GoalStatus, number> = { draft: 0, active: 0, completed: 0 }
  const byCategory: Record<GoalCategory, number> = { performance: 0, development: 0, organizational: 0 }

  let milestonesTotal = 0
  let milestonesCompleted = 0
  let milestonesInProgress = 0
  let milestonesPlanned = 0
  let criteriaTotal = 0
  let criteriaChecked = 0
  let overdueMilestones = 0

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const soon = new Date(now)
  soon.setDate(soon.getDate() + 30)

  const upcoming: OverallStats['upcomingMilestones'] = []

  const quarterItems: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }

  for (const g of goals) {
    byStatus[g.status || 'draft']++
    byCategory[g.category]++
    criteriaTotal += g.successCriteria.length
    criteriaChecked += g.checkedCriteria?.length || 0

    for (const m of g.milestones) {
      milestonesTotal++
      if (m.status === 'completed') milestonesCompleted++
      else if (m.status === 'in_progress') milestonesInProgress++
      else milestonesPlanned++

      const d = parseGoalDate(m.dueDate)
      if (d && m.status !== 'completed') {
        if (d < now) overdueMilestones++
        else if (d <= soon) {
          upcoming.push({ goalName: g.targetName, milestoneId: m.id, dueDate: m.dueDate, description: m.description })
        }
      }
    }

    for (const qp of g.quarterPlans) {
      const filledItems = qp.items.filter((i) => i.trim()).length
      quarterItems[qp.quarter] = (quarterItems[qp.quarter] || 0) + filledItems
    }
  }

  const totalWeight = milestonesTotal + criteriaTotal
  const doneWeight = milestonesCompleted + criteriaChecked
  const overallPercent = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0

  upcoming.sort((a, b) => {
    const da = parseGoalDate(a.dueDate)
    const db = parseGoalDate(b.dueDate)
    return (da?.getTime() || 0) - (db?.getTime() || 0)
  })

  const categories: GoalCategory[] = ['performance', 'development', 'organizational']
  const catLabels: Record<GoalCategory, string> = { performance: 'Performance', development: 'Development', organizational: 'Organizational' }
  const categoryProgress = categories.map((cat) => {
    const catGoals = goals.filter((g) => g.category === cat)
    if (catGoals.length === 0) return { category: cat, label: catLabels[cat], percent: 0, count: 0 }
    const total = catGoals.reduce((s, g) => s + g.milestones.length + g.successCriteria.length, 0)
    const done = catGoals.reduce((s, g) => {
      const mc = g.milestones.filter((m) => m.status === 'completed').length
      const cc = g.checkedCriteria?.length || 0
      return s + mc + cc
    }, 0)
    return { category: cat, label: catLabels[cat], percent: total > 0 ? Math.round((done / total) * 100) : 0, count: catGoals.length }
  })

  const quarterActivity = Object.entries(quarterItems).map(([quarter, items]) => ({ quarter, items }))

  return {
    totalGoals: goals.length,
    byStatus,
    byCategory,
    milestonesTotal,
    milestonesCompleted,
    milestonesInProgress,
    milestonesPlanned,
    criteriaTotal,
    criteriaChecked,
    overdueMilestones,
    upcomingMilestones: upcoming.slice(0, 5),
    overallPercent,
    categoryProgress,
    quarterActivity,
  }
}
