import { ChatMessage, ChatMode, Goal, GoalCategory, UserProfile } from '@/types'

export const buildAutoGenerateGoalsPrompt = (profile: UserProfile & { targetYear: number }) => `
You are a career coach helping a ${profile.role} at ${profile.company}
build annual SMART performance targets for their Workday system.

Engineer profile:
- Tech stack: ${profile.stack.join(', ')}
- Current projects: ${profile.currentProjects}
- Learning goals: ${profile.learningGoals}
- Team/org goals: ${profile.teamGoals}
- Planning year: ${profile.targetYear}

Generate 5-7 realistic performance targets covering:
1. Main delivery/project target (performance)
2. Technical ownership/improvements (performance)
3. Learning target — technical skills (development)
4. Learning target — cloud/infra (development)
5. Knowledge sharing target (organizational)
6. AI/automation target if relevant (organizational)
7. Optional: additional technical target

Return ONLY valid JSON array, no markdown:
[
  {
    "targetNumber": 1,
    "targetName": "Short name",
    "targetDetails": "1-2 sentence SMART summary with metrics",
    "category": "performance",
    "suggestedReason": "1 sentence why this goal fits this engineer",
    "quarterPlans": [
      { "quarter": "Q1", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q2", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q3", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q4", "items": ["bullet 1", "bullet 2"] }
    ],
    "successCriteria": [
      "measurable criterion with number/percentage",
      "measurable criterion with number/percentage"
    ],
    "milestones": [
      { "id": "M1", "dueDate": "31.03.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M2", "dueDate": "30.06.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M3", "dueDate": "30.09.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M4", "dueDate": "31.12.${profile.targetYear}", "description": "specific deliverable" }
    ]
  }
]

Rules:
- Quarters must be progressive and realistic
- Development targets may skip Q1-Q2 if learning starts later
- Success Criteria must include numbers: %, counts, story points
- Milestones must have concrete deliverables, not vague statements
- suggestedReason must reference the engineer's specific context
- Match the style of enterprise Workday performance targets
`

export const buildAutoGenerateWithPreviousYearPrompt = (
  profile: UserProfile & { targetYear: number },
  previousYearGoals: Goal[]
) => `
You are a career coach helping a ${profile.role} at ${profile.company}
build annual SMART performance targets for their Workday system.

Engineer profile:
- Tech stack: ${profile.stack.join(', ')}
- Current projects: ${profile.currentProjects}
- Learning goals: ${profile.learningGoals}
- Team/org goals: ${profile.teamGoals}
- Planning year: ${profile.targetYear}

PREVIOUS YEAR (${profile.targetYear - 1}) TARGETS FOR CONTEXT:
${previousYearGoals.map((g) => `- ${g.targetName} (${g.category}): ${g.targetDetails}`).join('\n')}

Generate 5-7 realistic performance targets for ${profile.targetYear}.
Build on the previous year's work where appropriate:
- Continue multi-year initiatives to the next level
- Introduce new targets based on evolved skills
- Don't repeat completed one-time targets
- Reference previous achievements where relevant

Return ONLY valid JSON array, no markdown:
[
  {
    "targetNumber": 1,
    "targetName": "Short name",
    "targetDetails": "1-2 sentence SMART summary with metrics",
    "category": "performance",
    "suggestedReason": "1 sentence why this goal fits, referencing previous year context if applicable",
    "quarterPlans": [
      { "quarter": "Q1", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q2", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q3", "items": ["bullet 1", "bullet 2"] },
      { "quarter": "Q4", "items": ["bullet 1", "bullet 2"] }
    ],
    "successCriteria": [
      "measurable criterion with number/percentage",
      "measurable criterion with number/percentage"
    ],
    "milestones": [
      { "id": "M1", "dueDate": "31.03.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M2", "dueDate": "30.06.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M3", "dueDate": "30.09.${profile.targetYear}", "description": "specific deliverable" },
      { "id": "M4", "dueDate": "31.12.${profile.targetYear}", "description": "specific deliverable" }
    ]
  }
]

Rules:
- Quarters must be progressive and realistic
- Success Criteria must include numbers: %, counts, story points
- Milestones must have concrete deliverables, not vague statements
- suggestedReason must reference the engineer's specific context
- Match the style of enterprise Workday performance targets
`

export const buildSingleGoalPrompt = (
  rawInput: string,
  category: GoalCategory,
  profile: Partial<UserProfile>,
  year: number = 2026
) => `
You are a career coach helping a ${profile.role || 'Senior Engineer'}
at ${profile.company || 'a tech company'} write a SMART Workday target.

Raw goal description: "${rawInput}"
Category: ${category}
Year: ${year}

Return ONLY valid JSON, no markdown:
{
  "targetName": "Short descriptive name",
  "targetDetails": "1-2 sentence SMART summary with measurable outcomes",
  "quarterPlans": [
    { "quarter": "Q1", "items": ["bullet 1", "bullet 2"] },
    { "quarter": "Q2", "items": ["bullet 1", "bullet 2"] },
    { "quarter": "Q3", "items": ["bullet 1", "bullet 2"] },
    { "quarter": "Q4", "items": ["bullet 1", "bullet 2"] }
  ],
  "successCriteria": [
    "criterion with number/percentage",
    "criterion with number/percentage",
    "criterion with number/percentage"
  ],
  "milestones": [
    { "id": "M1", "dueDate": "31.03.${year}", "description": "concrete deliverable" },
    { "id": "M2", "dueDate": "30.06.${year}", "description": "concrete deliverable" },
    { "id": "M3", "dueDate": "30.09.${year}", "description": "concrete deliverable" },
    { "id": "M4", "dueDate": "31.12.${year}", "description": "concrete deliverable" }
  ]
}

Rules:
- Skip quarters only if input explicitly says so
- All Success Criteria must be measurable
- Milestones must be progressive
`

export const buildImproveByCommentPrompt = (
  goal: Goal,
  managerComment: string
) => `
An engineering manager left this feedback on a Workday target:
"${managerComment}"

Current target:
Name: ${goal.targetName}
Details: ${goal.targetDetails}
Success Criteria:
${goal.successCriteria.map((c) => `- ${c}`).join('\n')}
Milestones:
${goal.milestones.map((m) => `${m.id} (${m.dueDate}): ${m.description}`).join('\n')}

Improve the target to address the manager's feedback.
Keep all existing facts. Only add specificity, evidence, and measurability.

Return ONLY valid JSON, no markdown:
{
  "targetDetails": "improved",
  "successCriteria": ["improved criterion 1", "..."],
  "milestones": [
    { "id": "M1", "dueDate": "${goal.milestones[0]?.dueDate || '31.03.2026'}", "description": "improved" },
    { "id": "M2", "dueDate": "${goal.milestones[1]?.dueDate || '30.06.2026'}", "description": "improved" },
    { "id": "M3", "dueDate": "${goal.milestones[2]?.dueDate || '30.09.2026'}", "description": "improved" },
    { "id": "M4", "dueDate": "${goal.milestones[3]?.dueDate || '31.12.2026'}", "description": "improved" }
  ]
}
`

export const buildChatSidebarPrompt = (ctx: {
  mode: ChatMode
  userMessage: string
  profile: UserProfile | null
  currentGoal?: Goal | null
  history: ChatMessage[]
}) => {
  const historyText = ctx.history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')

  const profileText = ctx.profile
    ? `User: ${ctx.profile.role} at ${ctx.profile.company}, stack: ${ctx.profile.stack.join(', ')}`
    : 'No profile available'

  const goalText = ctx.currentGoal
    ? `Current goal: "${ctx.currentGoal.targetName}" — ${ctx.currentGoal.targetDetails}`
    : ''

  const modeInstructions: Record<ChatMode, string> = {
    generate: 'Help the user brainstorm new performance targets. Suggest specific, measurable goals based on their profile.',
    improve: `Help improve the selected goal. Suggest better metrics, clearer milestones, and more specific success criteria. ${goalText}`,
    general: 'Answer questions about performance targets, career development, and the Workday target format.',
  }

  return `You are a career coach AI assistant helping an engineer with their annual performance targets.

${profileText}
${goalText}

Mode: ${ctx.mode}
Instructions: ${modeInstructions[ctx.mode]}

Recent conversation:
${historyText}

User: ${ctx.userMessage}

Respond concisely (2-4 sentences). Be specific and actionable. Use the profile and goal context.
Return ONLY plain text, no JSON, no markdown formatting.`
}
