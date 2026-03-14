import { Goal } from '@/types'
import { categoryLabels } from '@/lib/constants'

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

export function buildWorkdayGoalName(goal: Goal): string {
  return goal.targetName
}

export function buildWorkdayDescription(goal: Goal): string {
  let text = goal.targetDetails + '\n'

  if (goal.quarterPlans.length > 0) {
    text += '\nQuarterly Plan:\n'
    goal.quarterPlans.forEach((qp) => {
      text += `${qp.quarter}: ${qp.items.join('; ')}\n`
    })
  }

  return text.trim()
}

export function buildWorkdayMilestones(goal: Goal): string {
  if (goal.milestones.length === 0) return ''
  return goal.milestones
    .map((m) => `${m.id} (${m.dueDate}): ${m.description}`)
    .join('\n')
}

export function buildWorkdayCriteria(goal: Goal): string {
  if (goal.successCriteria.length === 0) return ''
  return goal.successCriteria.map((c) => `- ${c}`).join('\n')
}

export function buildWorkdayDueDate(goal: Goal): string {
  if (goal.dueDate) return goal.dueDate
  if (goal.milestones.length > 0) return goal.milestones[goal.milestones.length - 1].dueDate
  return ''
}

export function buildWorkdayExport(goals: Goal[]): string {
  if (goals.length === 0) return ''
  const sorted = [...goals].sort((a, b) => a.targetNumber - b.targetNumber)
  const sections: string[] = []

  for (const goal of sorted) {
    const dueDate = buildWorkdayDueDate(goal)
    let section = `═══════════════════════════════════════\n`
    section += `TARGET ${goal.targetNumber}: ${goal.targetName}\n`
    section += `Category: ${categoryLabels[goal.category]}\n`
    if (dueDate) section += `Due Date: ${dueDate}\n`
    section += `═══════════════════════════════════════\n\n`

    section += `DESCRIPTION:\n${goal.targetDetails}\n\n`

    if (goal.quarterPlans.length > 0) {
      section += `QUARTERLY PLAN:\n`
      goal.quarterPlans.forEach((qp) => {
        section += `  ${qp.quarter}:\n`
        qp.items.forEach((item) => {
          section += `    - ${item}\n`
        })
      })
      section += '\n'
    }

    if (goal.successCriteria.length > 0) {
      section += `SUCCESS CRITERIA:\n`
      goal.successCriteria.forEach((c) => {
        section += `  - ${c}\n`
      })
      section += '\n'
    }

    if (goal.milestones.length > 0) {
      section += `MILESTONES:\n`
      goal.milestones.forEach((m) => {
        const status = m.status === 'completed' ? '[DONE]' : m.status === 'in_progress' ? '[IN PROGRESS]' : '[PLANNED]'
        section += `  ${m.id} (${m.dueDate}) ${status}: ${m.description}\n`
      })
    }

    sections.push(section.trim())
  }

  return sections.join('\n\n\n')
}
