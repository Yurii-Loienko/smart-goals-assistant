import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface YearSelectorProps {
  currentYear: number
  availableYears: number[]
  onChange: (year: number) => void
}

export function YearSelector({ currentYear, availableYears, onChange }: YearSelectorProps) {
  const baseYear = new Date().getFullYear()
  const years = Array.from(new Set([...availableYears, baseYear - 1, baseYear, baseYear + 1])).sort()

  return (
    <div className="flex gap-1">
      {years.map((year) => (
        <Button
          key={year}
          variant={year === currentYear ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'text-sm tabular-nums',
            year === currentYear && 'pointer-events-none'
          )}
          onClick={() => onChange(year)}
        >
          {year}
        </Button>
      ))}
    </div>
  )
}
