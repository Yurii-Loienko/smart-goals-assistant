import { Goal } from '@/types'
import { categoryLabels } from '@/lib/constants'
import { formatDateDisplay } from '@/lib/dates'
import { UserProfile } from '@/types'

interface PrintViewProps {
  goals: Goal[]
  profile: UserProfile
  year: number
}

export function PrintView({ goals, profile, year }: PrintViewProps) {
  const sorted = [...goals].sort((a, b) => a.targetNumber - b.targetNumber)

  return (
    <div className="print-only p-8 max-w-[800px] mx-auto">
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">SMART Performance Targets {year}</h1>
        <p className="text-sm mt-1">{profile.name} — {profile.role}{profile.company ? ` at ${profile.company}` : ''}</p>
      </div>

      {sorted.map((goal, idx) => (
        <div key={goal.id} className={idx > 0 ? 'print-break' : ''}>
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="text-lg font-bold">
                Target {goal.targetNumber}: {goal.targetName}
              </h2>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                [{categoryLabels[goal.category]}]
              </span>
            </div>
            {goal.dueDate && (
              <p className="text-xs text-gray-500 mb-2">Due: {formatDateDisplay(goal.dueDate)}</p>
            )}
            <p className="text-sm leading-relaxed mb-4">{goal.targetDetails}</p>

            <h3 className="text-sm font-semibold mb-2">Quarterly Plan</h3>
            <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
              {goal.quarterPlans.map((qp) => (
                <div key={qp.quarter}>
                  <p className="font-semibold mb-1">{qp.quarter}</p>
                  <ul className="space-y-0.5">
                    {qp.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold mb-2">Success Criteria</h3>
            <ul className="text-xs space-y-1 mb-4">
              {goal.successCriteria.map((c, i) => (
                <li key={i}>☐ {c}</li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold mb-2">Milestones</h3>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 w-12">ID</th>
                  <th className="text-left py-1 w-28">Due Date</th>
                  <th className="text-left py-1">Deliverable</th>
                  <th className="text-left py-1 w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {goal.milestones.map((m) => (
                  <tr key={m.id} className="border-b border-gray-200">
                    <td className="py-1 font-medium">{m.id}</td>
                    <td className="py-1">{formatDateDisplay(m.dueDate)}</td>
                    <td className="py-1">{m.description}</td>
                    <td className="py-1 capitalize">{m.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
