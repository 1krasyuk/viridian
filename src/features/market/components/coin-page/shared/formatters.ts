export function formatCompact(n: number, maximumFractionDigits = 4): string {
  if (!isFinite(n) || n === 0) return '—'
  if (Math.abs(n) >= 1_000_000_000_000)
    return (n / 1_000_000_000_000).toFixed(2) + 'T'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits })
}

export function formatCurrency(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

export function formatPercent(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(1) + '%'
}

export function formatThousandsCompact(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toFixed(0)
}
