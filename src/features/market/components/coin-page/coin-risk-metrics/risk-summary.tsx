import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  calculateMarketStress,
  getLiquidityLabel,
  getMomentum,
  getVolatilityTrend,
} from './risk-calculations'

export function getRiskSummary(
  volTrend: ReturnType<typeof getVolatilityTrend>,
  momentum: ReturnType<typeof getMomentum>,
  stress: ReturnType<typeof calculateMarketStress>,
  liquidity: ReturnType<typeof getLiquidityLabel>,
  change24h: number | null | undefined,
): {
  level: 'Low' | 'Moderate' | 'High' | 'Extreme'
  color: string
  bg: string
  icon: React.ReactNode
  text: string
} {
  const avgScore = Math.round(
    volTrend.score * 0.3 +
      momentum.score * 0.2 +
      stress.score * 0.4 +
      (100 - liquidity.score) * 0.1,
  )

  let level: 'Low' | 'Moderate' | 'High' | 'Extreme'
  let color: string
  let bg: string
  let icon: React.ReactNode

  if (avgScore > 60) {
    level = 'Extreme'
    color = 'text-red-500'
    bg = 'bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20'
    icon = <ShieldAlert className='h-4 w-4 text-red-500' />
  } else if (avgScore > 40) {
    level = 'High'
    color = 'text-orange-500'
    bg =
      'bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20'
    icon = <ShieldAlert className='h-4 w-4 text-orange-500' />
  } else if (avgScore > 20) {
    level = 'Moderate'
    color = 'text-amber-500'
    bg =
      'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20'
    icon = <Shield className='h-4 w-4 text-amber-500' />
  } else {
    level = 'Low'
    color = 'text-emerald-500'
    bg =
      'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20'
    icon = <ShieldCheck className='h-4 w-4 text-emerald-500' />
  }

  const parts: string[] = []
  const h24 = change24h ?? 0

  if (volTrend.label === 'Escalating') {
    parts.push('price swings are intensifying rapidly')
  } else if (volTrend.label === 'Rising') {
    parts.push('volatility is picking up')
  } else if (volTrend.label === 'Cooling') {
    parts.push('volatility is settling down')
  } else if (volTrend.label === 'Cool') {
    parts.push('price action is calm')
  }

  if (momentum.label === 'Surging') {
    parts.push('upward momentum is surging well above average pace')
  } else if (momentum.label === 'Accelerating') {
    parts.push(
      h24 >= 0
        ? 'buying momentum is accelerating'
        : 'selling pressure is accelerating',
    )
  } else if (momentum.label === 'Collapsing') {
    parts.push('downside momentum is collapsing fast')
  } else if (momentum.label === 'Falling Fast') {
    parts.push('downside move is intensifying')
  } else if (momentum.label === 'Decelerating') {
    parts.push('the current move is losing steam')
  } else if (momentum.label === 'Flat') {
    parts.push('price has been flat over the week')
  }

  if (stress.label === 'Extreme') {
    parts.push('market stress is at extreme levels')
  } else if (stress.label === 'High') {
    parts.push('market stress is elevated')
  } else if (stress.label === 'Moderate') {
    parts.push('some stress signals are present')
  }

  if (liquidity.label === 'Very Low') {
    parts.push(
      'liquidity is critically thin — large orders will move price significantly',
    )
  } else if (liquidity.label === 'Low') {
    parts.push('liquidity is below average')
  } else if (liquidity.label === 'Very High' || liquidity.label === 'High') {
    parts.push('liquidity is healthy')
  }

  let text: string
  if (parts.length === 0) {
    text =
      'Market conditions appear stable with no significant risk signals detected.'
  } else {
    const sentence = parts.join(', ') + '.'
    text = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  }

  return { level, color, bg, icon, text }
}
