import { Goal } from '@/types'

export function buildFullTargetText(goal: Goal) {
  let text = `Target ${goal.targetNumber}: ${goal.targetName}\n`
  if (goal.dueDate) text += `Due Date: ${goal.dueDate}\n`
  text += `\n${goal.targetDetails}\n\n`
  text += `Quarterly Plan:\n`
  goal.quarterPlans.forEach((qp) => {
    text += `\n${qp.quarter}:\n`
    qp.items.forEach((item) => (text += `  - ${item}\n`))
  })
  text += `\nSuccess Criteria:\n`
  goal.successCriteria.forEach((c) => (text += `  - ${c}\n`))
  text += `\nMilestones:\n`
  goal.milestones.forEach(
    (m) => (text += `  ${m.id} (${m.dueDate}): ${m.description}\n`)
  )
  return text
}

export function buildAllGoalsText(goals: Goal[]) {
  if (goals.length === 0) return ''
  return goals
    .sort((a, b) => a.targetNumber - b.targetNumber)
    .map((goal) => buildFullTargetText(goal))
    .join('\n---\n\n')
}
