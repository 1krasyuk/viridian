export function formatScenarioPercent(n: number): string {
  if (!isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(1)}%`
}

export function getProbabilityColor(conf: number) {
  if (conf >= 70)
    return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/8'
  if (conf >= 40)
    return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/8'
  return 'text-red-500 border-red-500/20 bg-red-500/8'
}
