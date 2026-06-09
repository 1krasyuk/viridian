import { Target, TrendingDown, TrendingUp } from 'lucide-react'

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function stddev(values: number[]) {
  if (!values.length) return 0
  const mean = average(values)
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function getMarketCapTier(mcap: number) {
  if (mcap >= 300_000_000_000) return 'mega'
  if (mcap >= 50_000_000_000) return 'large'
  if (mcap >= 10_000_000_000) return 'mid'
  if (mcap >= 1_000_000_000) return 'small'
  return 'micro'
}

export function getVolatilityProfile(volatility: number) {
  if (volatility < 12) return { label: 'Stable', level: 'low' as const }
  if (volatility < 30) return { label: 'Moderate', level: 'medium' as const }
  return { label: 'Volatile', level: 'high' as const }
}

export function buildScenarios(params: {
  currentPrice: number
  investment: number
  months: number
  marketCap: number
  volume: number
  trendScore: number
  volatility: number
  athDistance: number
}) {
  const {
    currentPrice,
    investment,
    months,
    marketCap,
    volume,
    trendScore,
    volatility,
    athDistance,
  } = params
  const tier = getMarketCapTier(marketCap)
  const horizonFactor = clamp(months / 12, 0.5, 3)

  const liquidityRatio = marketCap > 0 ? volume / marketCap : 0
  let confidence = 50
  if (tier === 'mega') confidence += 30
  else if (tier === 'large') confidence += 20
  else if (tier === 'mid') confidence += 10
  else if (tier === 'micro') confidence -= 15
  if (liquidityRatio > 0.12) confidence += 10
  if (liquidityRatio < 0.02) confidence -= 10
  if (volatility > 35) confidence -= 15
  else if (volatility < 12) confidence += 10
  confidence = clamp(confidence, 5, 95)

  const horizonPenalty = months > 24 ? 15 : months > 12 ? 5 : 0
  confidence = clamp(confidence - horizonPenalty, 5, 95)

  let baseBull = 0,
    baseBase = 0,
    baseBear = 0
  switch (tier) {
    case 'mega':
      baseBull = 90
      baseBase = 28
      baseBear = -25
      break
    case 'large':
      baseBull = 160
      baseBase = 45
      baseBear = -35
      break
    case 'mid':
      baseBull = 260
      baseBase = 70
      baseBear = -45
      break
    case 'small':
      baseBull = 450
      baseBase = 110
      baseBear = -60
      break
    default:
      baseBull = 900
      baseBase = 180
      baseBear = -75
  }

  const trendBoost = clamp(trendScore / 40, -0.5, 1.5)
  const volMultiplier = clamp(volatility / 20, 0.7, 2.5)
  const recoveryBoost = athDistance < -70 ? 1.35 : athDistance < -50 ? 1.2 : 1

  const bullHigh =
    baseBull * horizonFactor * (1 + trendBoost) * volMultiplier * recoveryBoost
  const baseHigh = baseBase * horizonFactor * (1 + trendBoost * 0.5)
  const bearLow =
    baseBear *
    horizonFactor *
    (1 + trendBoost * 0.3) *
    clamp(volMultiplier, 1, 1.8)

  const getDrivers = (type: 'bear' | 'base' | 'bull') => {
    const baseDrivers: Record<string, string[]> = {
      bear: [
        'Weak liquidity conditions',
        'High downside volatility',
        'BTC dominance expansion',
      ],
      base: [
        'Steady market participation',
        'Historical growth continuation',
        'Normal cycle expansion',
      ],
      bull: [
        'Aggressive capital inflows',
        'Speculative momentum',
        'Risk-on rotation',
      ],
    }
    const drivers = [...baseDrivers[type]]
    if (months > 12) drivers.push('Long-term uncertainty increases')
    if (months > 24)
      drivers.push('Macro factors dominate, model reliability decreases')
    if (volatility > 30) drivers.push('High volatility widens projection range')
    if (trendScore < -10) drivers.push('Negative momentum pressure')
    else if (trendScore > 20) drivers.push('Strong positive momentum')
    return drivers
  }

  return [
    {
      type: 'bear' as const,
      lowReturn: bearLow,
      highReturn: bearLow * 0.45,
      lowPrice: currentPrice * (1 + bearLow / 100),
      highPrice: currentPrice * (1 + (bearLow * 0.45) / 100),
      lowValue: investment * (1 + bearLow / 100),
      highValue: investment * (1 + (bearLow * 0.45) / 100),
      confidence: clamp(confidence + 10, 5, 95),
      label: 'Bear Market',
      desc: 'Risk-off environment',
      icon: TrendingDown,
      color: 'red' as const,
      drivers: getDrivers('bear'),
    },
    {
      type: 'base' as const,
      lowReturn: baseHigh * 0.45,
      highReturn: baseHigh,
      lowPrice: currentPrice * (1 + (baseHigh * 0.45) / 100),
      highPrice: currentPrice * (1 + baseHigh / 100),
      lowValue: investment * (1 + (baseHigh * 0.45) / 100),
      highValue: investment * (1 + baseHigh / 100),
      confidence,
      label: 'Base Case',
      desc: 'Normal continuation',
      icon: Target,
      color: 'blue' as const,
      drivers: getDrivers('base'),
    },
    {
      type: 'bull' as const,
      lowReturn: bullHigh * 0.4,
      highReturn: bullHigh,
      lowPrice: currentPrice * (1 + (bullHigh * 0.4) / 100),
      highPrice: currentPrice * (1 + bullHigh / 100),
      lowValue: investment * (1 + (bullHigh * 0.4) / 100),
      highValue: investment * (1 + bullHigh / 100),
      confidence: clamp(confidence - 25, 5, 80),
      label: 'Bull Cycle',
      desc: 'Euphoric expansion',
      icon: TrendingUp,
      color: 'emerald' as const,
      drivers: getDrivers('bull'),
    },
  ]
}
