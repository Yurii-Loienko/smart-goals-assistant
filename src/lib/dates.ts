export function parseGoalDate(dateStr: string): Date | null {
  if (!dateStr) return null

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }

  const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dotMatch) {
    const d = new Date(+dotMatch[3], +dotMatch[2] - 1, +dotMatch[1])
    return isNaN(d.getTime()) ? null : d
  }

  const d = new Date(dateStr + ' ' + new Date().getFullYear())
  return isNaN(d.getTime()) ? null : d
}

export function formatDateDisplay(dateStr: string): string {
  const d = parseGoalDate(dateStr)
  if (!d) return dateStr
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function toInputDate(dateStr: string): string {
  const d = parseGoalDate(dateStr)
  if (!d) return ''
  return d.toISOString().split('T')[0]
}

export function fromInputDate(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return isoStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
}

export function isOverdue(dateStr: string): boolean {
  const d = parseGoalDate(dateStr)
  if (!d) return false
  return d < new Date()
}
