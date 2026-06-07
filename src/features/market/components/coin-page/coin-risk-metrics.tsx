// features/market/components/coin-page/coin-risk-metrics.tsx
import {
  Activity,
  TrendingDown,
  Zap,
  Gauge,
  ChevronDown,
  Clock,
  Droplets,
  BarChart3,
  Info,
  TrendingUp,
  Flame,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Shield,
  HeartPulse,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Coin } from '../../types/coin'
import type { CoinChart } from '../../types/coin-chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

function calculateVolatility(prices?: { value: number }[]): number | null {
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

function calculateMaxDrawdown(prices?: { value: number }[]): number | null {
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

function getVolatilityTrend(
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

function getMomentum(
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

function calculateMarketStress(
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

function getLiquidityLabel(turnover: number): {
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

function getRiskSummary(
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

const PERIOD_LABELS: Record<string, string> = {
  '1': '24H',
  '7': '7D',
  '30': '1M',
  '90': '3M',
  '365': '1Y',
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

type MetricCardProps = {
  label: string
  value?: React.ReactNode
  sub?: string
  icon: React.ReactNode
  color?: string
  tooltip?: string
  isLoading?: boolean
  variant?: 'default' | 'glass' | 'accent'
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  color = 'text-muted-foreground',
  tooltip,
  isLoading = false,
  variant = 'default',
}: MetricCardProps) {
  const variants = {
    default:
      'bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30',
    glass:
      'bg-background/60 backdrop-blur-sm border border-border/40 shadow-sm',
    accent:
      'bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10',
  }

  return (
    <div
      className={`p-3 rounded-xl space-y-1.5 transition-all duration-200 ${variants[variant]}`}
    >
      <div className='flex items-center gap-1.5'>
        <span className={color}>{icon}</span>
        <span className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-3 w-3 text-muted-foreground/60 shrink-0 transition-colors' />
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-70'>
                <p className='text-xs'>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className='h-7 w-24 rounded-lg' />
          <Skeleton className='h-3 w-32 rounded-lg' />
        </>
      ) : (
        <>
          <div className='text-lg font-bold leading-tight'>{value}</div>
          {sub && (
            <div className='text-xs text-muted-foreground font-mono'>{sub}</div>
          )}
        </>
      )}
    </div>
  )
}

function getRiskColor(
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

/* ─────────────────────────────────────────────
   RISK NOW COMPONENT
   ───────────────────────────────────────────── */

function CoinRiskNow({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading: boolean
}) {
  const md = coin?.market_data
  const change1h = md?.price_change_percentage_1h_in_currency?.usd
  const change24h = md?.price_change_percentage_24h_in_currency?.usd
  const change7d = md?.price_change_percentage_7d_in_currency?.usd

  const volTrend = isLoading
    ? null
    : getVolatilityTrend(change1h, change24h, change7d)
  const momentum = isLoading ? null : getMomentum(change24h, change7d)

  const volume24h = md?.total_volume?.usd
  const marketCap = md?.market_cap?.usd
  const turnover = volume24h && marketCap ? (volume24h / marketCap) * 100 : 0
  const liquidity = getLiquidityLabel(turnover)

  const stress = isLoading
    ? null
    : calculateMarketStress(change1h, change24h, turnover)
  const summary = isLoading
    ? null
    : getRiskSummary(volTrend!, momentum!, stress!, liquidity, change24h)

  return (
    <div className='space-y-4 h-full flex flex-col'>
      <div className='flex items-center gap-2.5'>
        <div className='w-8 h-8 rounded-lg bg-linear-to-br from-red-500/15 to-orange-500/10 flex items-center justify-center border border-red-500/10'>
          <HeartPulse className='h-4 w-4 text-red-500' />
        </div>
        <h4 className='text-base font-bold tracking-tight'>Risk Now</h4>
      </div>
      <div className='grid grid-cols-2 gap-2.5'>
        <MetricCard
          label='Volatility'
          value={
            volTrend ? (
              <span className={volTrend.color}>{volTrend.label}</span>
            ) : undefined
          }
          sub={volTrend?.sub}
          icon={<Wind className='h-3.5 w-3.5' />}
          color={volTrend?.color}
          tooltip='Compares 1h vs 24h vs 7d average daily change. Escalating = recent swings are bigger than usual.'
          isLoading={isLoading}
        />

        <MetricCard
          label='Momentum'
          value={
            momentum ? (
              <span className={momentum.color}>{momentum.label}</span>
            ) : undefined
          }
          sub={momentum?.sub}
          icon={<Zap className='h-3.5 w-3.5' />}
          color={momentum?.color}
          tooltip='24h change vs average daily 7d change. Surging/Collapsing = momentum is extreme.'
          isLoading={isLoading}
        />

        <MetricCard
          label='Stress'
          value={
            stress ? (
              <span className={stress.color}>{stress.label}</span>
            ) : undefined
          }
          sub={stress?.sub}
          icon={<Flame className='h-3.5 w-3.5' />}
          color={stress?.color}
          tooltip='Transparent formula: |24h|×3 + |1h|×4 + directionPenalty(15) + liquidityPenalty(8-20).'
          isLoading={isLoading}
        />

        <MetricCard
          label='Liquidity'
          value={
            liquidity ? (
              <span className={liquidity.color}>{liquidity.label}</span>
            ) : undefined
          }
          sub={`${turnover.toFixed(1)}% turnover`}
          icon={<Droplets className='h-3.5 w-3.5' />}
          color={liquidity.color}
          tooltip='Volume vs Market Cap ratio. Higher = easier to buy/sell without moving the price.'
          isLoading={isLoading}
        />
      </div>
      <div className='flex-1 flex flex-col'>
        {!isLoading && summary && (
          <div
            className={`rounded-xl border p-4 space-y-2.5 ${summary.bg} flex-1 flex flex-col`}
          >
            <div className='flex items-center gap-2 shrink-0'>
              {summary.icon}
              <span
                className={`text-xs font-bold uppercase tracking-wider ${summary.color}`}
              >
                {summary.level} Risk
              </span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed flex-1'>
              {summary.text}
            </p>
          </div>
        )}

        {isLoading && (
          <div className='rounded-xl border p-4 space-y-2.5 bg-linear-to-br from-muted/30 to-muted/10 flex-1'>
            <Skeleton className='h-4 w-28 rounded-lg' />
            <Skeleton className='h-4 w-full rounded-lg' />
            <Skeleton className='h-4 w-4/5 rounded-lg' />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PERIOD ANALYSIS COMPONENT
   ───────────────────────────────────────────── */

function CoinPeriodAnalysis({
  coin,
  chart,
  days,
  onDaysChange,
  isLoading,
}: {
  coin: Coin | undefined
  chart?: CoinChart
  days: string
  onDaysChange: (v: string) => void
  isLoading: boolean
}) {
  const prices = chart?.prices

  const periodVolatility = isLoading ? null : calculateVolatility(prices)
  const periodDrawdown = isLoading ? null : calculateMaxDrawdown(prices)

  const periodChange =
    !isLoading && prices && prices.length >= 2
      ? ((prices[prices.length - 1].value - prices[0].value) /
          prices[0].value) *
        100
      : null

  const avgPrice =
    !isLoading && prices && prices.length > 0
      ? prices.reduce((sum, p) => sum + p.value, 0) / prices.length
      : null

  const current = coin?.market_data?.current_price?.usd
  const vsAvg =
    !isLoading && current && avgPrice
      ? ((current - avgPrice) / avgPrice) * 100
      : null

  return (
    <div className='space-y-4 flex flex-col h-full'>
      <div className='flex items-center gap-2.5 shrink-0'>
        <div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-500/15 to-indigo-500/10 flex items-center justify-center border border-blue-500/10'>
          <Clock className='h-4 w-4 text-blue-500' />
        </div>
        <h4 className='text-base font-bold tracking-tight'>Period Analysis</h4>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs gap-1 px-2.5 rounded-lg ml-auto bg-muted/30 border-muted-foreground/10 hover:bg-muted/50'
              disabled={isLoading}
            >
              {PERIOD_LABELS[days] || days}
              <ChevronDown className='h-3 w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-20 rounded-xl'>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onDaysChange(value)}
                className={`text-xs px-2 py-1.5 rounded-lg cursor-pointer ${
                  days === value ? 'bg-accent' : ''
                }`}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid grid-cols-2 gap-2.5'>
        <MetricCard
          label='Return'
          value={
            periodChange !== null ? (
              <span className={getRiskColor(periodChange, 'higher-is-better')}>
                {periodChange >= 0 ? '+' : ''}
                {periodChange.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub={`over ${PERIOD_LABELS[days]?.toLowerCase() || days}`}
          icon={
            <TrendingUp
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodChange,
                'higher-is-better',
              )}`}
            />
          }
          tooltip='Total price change from start to end of the selected period.'
          isLoading={isLoading}
        />

        <MetricCard
          label='Swing'
          value={
            periodVolatility !== null ? (
              <span
                className={getRiskColor(periodVolatility, 'lower-is-better')}
              >
                {periodVolatility.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='price fluctuation'
          icon={
            <Activity
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodVolatility,
                'lower-is-better',
              )}`}
            />
          }
          tooltip='How much price bounced around during the period.'
          isLoading={isLoading}
        />

        <MetricCard
          label='Drawdown'
          value={
            periodDrawdown !== null ? (
              <span className={getRiskColor(periodDrawdown, 'lower-is-better')}>
                {periodDrawdown.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='peak-to-trough'
          icon={
            <TrendingDown
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodDrawdown,
                'lower-is-better',
              )}`}
            />
          }
          tooltip='Largest drop from a peak to a trough within the period.'
          isLoading={isLoading}
        />

        <MetricCard
          label='vs Average'
          value={
            vsAvg !== null ? (
              <span className={getRiskColor(vsAvg, 'higher-is-better')}>
                {vsAvg >= 0 ? '+' : ''}
                {vsAvg.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='current vs avg'
          icon={
            <BarChart3
              className={`h-3.5 w-3.5 ${getRiskColor(
                vsAvg,
                'higher-is-better',
              )}`}
            />
          }
          tooltip='How current price compares to the average price over the selected period.'
          isLoading={isLoading}
        />
      </div>

      {/* Period prices info — glass card */}
      <div className='flex-1 bg-linear-to-br from-muted/40 to-muted/20 p-4 rounded-xl border border-border/30 flex flex-col justify-center'>
        <div className='space-y-2'>
          <div className='flex justify-between text-xs'>
            <span className='text-muted-foreground'>Period open</span>
            {isLoading ? (
              <Skeleton className='h-3.5 w-20 rounded-lg' />
            ) : (
              <span className='font-mono font-medium'>
                $
                {prices?.[0]?.value.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                }) || '—'}
              </span>
            )}
          </div>
          <div className='flex justify-between text-xs'>
            <span className='text-muted-foreground'>Period close</span>
            {isLoading ? (
              <Skeleton className='h-3.5 w-20 rounded-lg' />
            ) : (
              <span className='font-mono font-medium'>
                $
                {prices?.[prices.length - 1]?.value.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                }) || '—'}
              </span>
            )}
          </div>
          <div className='flex justify-between text-xs'>
            <span className='text-muted-foreground'>Average</span>
            {isLoading ? (
              <Skeleton className='h-3.5 w-20 rounded-lg' />
            ) : (
              <span className='font-mono font-medium'>
                $
                {avgPrice?.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                }) || '—'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
   ───────────────────────────────────────────── */

export function CoinRiskMetrics({
  coin,
  chart,
  days,
  onDaysChange,
  isLoadingCoin = false,
  isLoadingChart = false,
}: {
  coin: Coin | undefined
  chart?: CoinChart
  days: string
  onDaysChange: (v: string) => void
  isLoadingCoin?: boolean
  isLoadingChart?: boolean
}) {
  return (
    <TooltipProvider>
      <div className='space-y-4'>
        {/* Header — personality */}
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
            <Gauge className='h-4 w-4 text-emerald-500' />
          </div>
          <div>
            <h3 className='text-base font-bold tracking-tight'>Risk Metrics</h3>
            <p className='text-xs text-muted-foreground'>
              Real-time risk analysis
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className='h-4 w-4 text-muted-foreground shrink-0 transition-colors' />
            </TooltipTrigger>
            <TooltipContent side='right' className='max-w-xs'>
              <div className='text-xs leading-relaxed space-y-1.5'>
                <p>
                  Combines volatility, momentum, market stress, and liquidity
                  data to give you a quick snapshot of current risk conditions.
                </p>
                <p className='text-muted-foreground'>
                  Left panel shows live risk signals. Right panel analyzes
                  historical performance over your selected time period.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch'>
          <div className='bg-linear-to-br from-card/60 to-background/40 backdrop-blur-sm rounded-xl border border-border/30 p-4'>
            <CoinRiskNow coin={coin} isLoading={isLoadingCoin} />
          </div>
          <div className='bg-linear-to-br from-card/60 to-background/40 backdrop-blur-sm rounded-xl border border-border/30 p-4'>
            <CoinPeriodAnalysis
              coin={coin}
              chart={chart}
              days={days}
              onDaysChange={onDaysChange}
              isLoading={isLoadingChart}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
