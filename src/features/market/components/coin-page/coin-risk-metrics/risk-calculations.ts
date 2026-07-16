export function calculateVolatility(prices?: { value: number }[]): number | null {
  if (!prices || prices.length < 2) return null
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i].value - prices[i - 1].value) / prices[i - 1].value)
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  return Math.sqrt(variance) * 100
}

export function calculateMaxDrawdown(
  prices?: { value: number }[],
): number | null {
  if (!prices || prices.length < 2) return null
  let maxPeak = prices[0].value
  let maxDrawdown = 0
  for (const { value } of prices) {
    if (value > maxPeak) maxPeak = value
    const drawdown = (maxPeak - value) / maxPeak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }
  return maxDrawdown * 100
}

export function getVolatilityTrend(
  change1h: number | null | undefined,
  change24h: number | null | undefined,
  change7d: number | null | undefined,
): { label: string; color: string; score: number; sub: string } {
  const h1 = change1h ?? 0
  const h24 = change24h ?? 0
  const d7 = change7d ?? 0

  const abs1h = Math.abs(h1)
  const abs24h = Math.abs(h24)
  const avgDaily7d = Math.abs(d7) / 7

  const isSignificant = abs24h > 1 || abs1h > 0.5
  const deviation = Math.max(0, abs24h - avgDaily7d)
  const rawScore = abs24h * 5 + abs1h * 8 + deviation * 10
  const score = Math.min(100, Math.round(rawScore))

  const isEscalating =
    isSignificant && (abs1h > abs24h || abs24h > avgDaily7d * 2)
  const isExtreme =
    isSignificant && (abs1h > 8 || abs24h > 15 || abs24h > avgDaily7d * 4)

  if (!isSignificant) {
    return {
      label: 'Cool',
      color: 'text-emerald-500',
      score,
      sub: `${score}/100 · micro-movement`,
    }
  }

  if (isExtreme && isEscalating) {
    return {
      label: 'Escalating',
      color: 'text-red-500',
      score,
      sub: `${score}/100 · 1h ${h1 >= 0 ? '+' : ''}${h1.toFixed(1)}%`,
    }
  }
  if (isEscalating) {
    return {
      label: 'Rising',
      color: 'text-orange-500',
      score,
      sub: `${score}/100 · 24h ${h24 >= 0 ? '+' : ''}${h24.toFixed(1)}%`,
    }
  }
  if (abs24h < avgDaily7d * 0.5) {
    return {
      label: 'Cooling',
      color: 'text-emerald-500',
      score,
      sub: `${score}/100 · below 7d avg`,
    }
  }
  return {
    label: 'Active',
    color: 'text-amber-500',
    score,
    sub: `${score}/100 · 24h ${h24 >= 0 ? '+' : ''}${h24.toFixed(1)}%`,
  }
}

export function getMomentum(
  change24h: number | null | undefined,
  change7d: number | null | undefined,
): { label: string; color: string; score: number; sub: string } {
  const h24 = change24h ?? null
  const d7 = change7d ?? null

  if (h24 === null || d7 === null) {
    return {
      label: '—',
      color: 'text-muted-foreground',
      score: 0,
      sub: 'no data',
    }
  }

  const avgDaily = d7 / 7

  if (Math.abs(d7) < 0.1) {
    return {
      label: 'Flat',
      color: 'text-muted-foreground',
      score: Math.min(100, Math.round(Math.abs(h24) * 5)),
      sub: `${Math.min(100, Math.round(Math.abs(h24) * 5))}/100 · 7d flat`,
    }
  }

  const ratio = avgDaily !== 0 ? h24 / avgDaily : 0
  const score = Math.min(100, Math.round(Math.abs(ratio) * 20))

  if (Math.abs(ratio) > 4) {
    return {
      label: ratio > 0 ? 'Surging' : 'Collapsing',
      color: ratio > 0 ? 'text-emerald-500' : 'text-red-500',
      score,
      sub: `${score}/100 · ${ratio > 0 ? '+' : ''}${ratio.toFixed(1)}× avg`,
    }
  }
  if (Math.abs(ratio) > 2) {
    return {
      label: ratio > 0 ? 'Accelerating' : 'Falling Fast',
      color: ratio > 0 ? 'text-emerald-400' : 'text-orange-500',
      score,
      sub: `${score}/100 · ${ratio > 0 ? '+' : ''}${ratio.toFixed(1)}× avg`,
    }
  }
  if (Math.abs(ratio) < 0.5) {
    return {
      label: 'Decelerating',
      color: 'text-amber-500',
      score,
      sub: `${score}/100 · ${ratio.toFixed(1)}× avg`,
    }
  }
  return {
    label: 'Steady',
    color: 'text-blue-400',
    score,
    sub: `${score}/100 · ${ratio > 0 ? '+' : ''}${ratio.toFixed(1)}× avg`,
  }
}

export function calculateMarketStress(
  change1h: number | null | undefined,
  change24h: number | null | undefined,
  turnover: number,
): { score: number; label: string; color: string; sub: string } {
  const h1 = change1h ?? 0
  const h24 = change24h ?? 0

  const abs24h = Math.abs(h24)
  const abs1h = Math.abs(h1)

  const baseStress = abs24h * 3
  const hourStress = abs1h * 4
  const directionPenalty = (h1 > 0 && h24 < 0) || (h1 < 0 && h24 > 0) ? 15 : 0
  const liquidityPenalty = turnover < 5 ? 20 : turnover < 20 ? 8 : 0

  const score = Math.min(
    100,
    Math.round(baseStress + hourStress + directionPenalty + liquidityPenalty),
  )

  if (score > 60) {
    return {
      score,
      label: 'Extreme',
      color: 'text-red-500',
      sub: `${score}/100 stress`,
    }
  }
  if (score > 40) {
    return {
      score,
      label: 'High',
      color: 'text-orange-500',
      sub: `${score}/100 stress`,
    }
  }
  if (score > 20) {
    return {
      score,
      label: 'Moderate',
      color: 'text-amber-500',
      sub: `${score}/100 stress`,
    }
  }
  return {
    score,
    label: 'Low',
    color: 'text-emerald-500',
    sub: `${score}/100 stress`,
  }
}

export function getLiquidityLabel(turnover: number): {
  label: string
  color: string
  score: number
} {
  if (turnover > 200)
    return { label: 'Extreme', color: 'text-purple-500', score: 100 }
  if (turnover > 100)
    return { label: 'Very High', color: 'text-emerald-500', score: 90 }
  if (turnover > 50)
    return { label: 'High', color: 'text-emerald-400', score: 75 }
  if (turnover > 20)
    return { label: 'Medium', color: 'text-amber-500', score: 50 }
  if (turnover > 5) return { label: 'Low', color: 'text-orange-500', score: 25 }
  return { label: 'Very Low', color: 'text-red-500', score: 10 }
}

export function getRiskColor(
  value: number | null,
  type: 'lower-is-better' | 'higher-is-better',
): string {
  if (value == null) return ''
  if (type === 'lower-is-better') {
    if (value < 10) return 'text-emerald-500'
    if (value < 30) return 'text-amber-500'
    if (value < 50) return 'text-orange-500'
    return 'text-red-500'
  }
  if (value > 20) return 'text-emerald-500'
  if (value > 0) return 'text-amber-500'
  if (value > -20) return 'text-orange-500'
  return 'text-red-500'
}
