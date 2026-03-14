import { QuarterPlan } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface QuarterTabsProps {
  quarterPlans: QuarterPlan[]
  editable?: boolean
  onChange?: (plans: QuarterPlan[]) => void
}

export function QuarterTabs({ quarterPlans, editable, onChange }: QuarterTabsProps) {
  const updateItem = (qi: number, ii: number, value: string) => {
    if (!onChange) return
    const updated = quarterPlans.map((qp, i) =>
      i === qi ? { ...qp, items: qp.items.map((item, j) => (j === ii ? value : item)) } : qp
    )
    onChange(updated)
  }

  const addItem = (qi: number) => {
    if (!onChange) return
    const updated = quarterPlans.map((qp, i) =>
      i === qi ? { ...qp, items: [...qp.items, ''] } : qp
    )
    onChange(updated)
  }

  const removeItem = (qi: number, ii: number) => {
    if (!onChange) return
    const updated = quarterPlans.map((qp, i) =>
      i === qi ? { ...qp, items: qp.items.filter((_, j) => j !== ii) } : qp
    )
    onChange(updated)
  }

  return (
    <Tabs defaultValue="Q1" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        {quarterPlans.map((qp) => (
          <TabsTrigger key={qp.quarter} value={qp.quarter}>
            {qp.quarter}
          </TabsTrigger>
        ))}
      </TabsList>
      {quarterPlans.map((qp, qi) => (
        <TabsContent key={qp.quarter} value={qp.quarter}>
          {editable ? (
            <div className="space-y-2 py-2">
              {qp.items.map((item, ii) => (
                <div key={ii} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(qi, ii, e.target.value)}
                    placeholder={`${qp.quarter} action item...`}
                  />
                  {qp.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground"
                      onClick={() => removeItem(qi, ii)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => addItem(qi)}>
                <Plus className="h-3 w-3 mr-1" /> Add item
              </Button>
            </div>
          ) : (
            <ul className="space-y-2 py-2">
              {qp.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-0.5">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
