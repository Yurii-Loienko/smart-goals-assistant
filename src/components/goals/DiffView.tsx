import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DiffSection {
  label: string
  oldValue: string
  newValue: string
}

interface DiffViewProps {
  sections: DiffSection[]
}

export function DiffView({ sections }: DiffViewProps) {
  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        if (section.oldValue === section.newValue) return null
        return (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Before</p>
                  <p className="text-sm whitespace-pre-line">{section.oldValue}</p>
                </div>
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">After</p>
                  <p className="text-sm whitespace-pre-line">{section.newValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
