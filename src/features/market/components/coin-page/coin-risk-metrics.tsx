// features/market/components/coin-page/coin-risk-metrics.tsx
import {
  Activity,
  TrendingDown,
  Zap,
  Gauge,
  ChevronDown,
  Clock,
  AlertTriangle,
  Droplets,
  BarChart3,
  Info,
  TrendingUp,
  Flame,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Shield,
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

/* ─── Volatility Trend ───
   Compares 1h vs 24h vs 7d average daily.
   Score 0-100. Higher = more volatile.
   Minimum thresholds to avoid noise on stables. */
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

  // Minimum significance threshold: ignore micro-movements on stables
  const isSignificant = abs24h > 1 || abs1h > 0.5

  // Score: scaled so BTC ±5% = ~50, ±15% = ~100
  // Base: 24h magnitude (×5) + 1h magnitude (×8) + deviation from 7d avg (×10)
  const deviation = Math.max(0, abs24h - avgDaily7d)
  const rawScore = abs24h * 5 + abs1h * 8 + deviation * 10
  const score = Math.min(100, Math.round(rawScore))

  // Trend detection only for significant moves
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

/* ─── Momentum ───
   24h vs average daily 7d change.
   Score 0-100. Higher = more extreme momentum.
   Guard against near-zero 7d changes (stables). */
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

  // Guard: if 7d is flat (<0.1% total), momentum is meaningless
  if (Math.abs(d7) < 0.1) {
    return {
      label: 'Flat',
      color: 'text-muted-foreground',
      score: Math.min(100, Math.round(Math.abs(h24) * 5)),
      sub: `${Math.min(100, Math.round(Math.abs(h24) * 5))}/100 · 7d flat`,
    }
  }

  const ratio = avgDaily !== 0 ? h24 / avgDaily : 0

  // Score: |ratio| × 20, capped at 100
  // ratio 1 = 20, ratio 2 = 40, ratio 3 = 60, ratio 5 = 100
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

/* ─── Market Stress ───
   Simplified transparent formula:
   - Base: |24h change| × 3  (0-45 for typical ±15%)
   - 1h chaos: |1h change| × 4  (0-40 for ±10%)
   - Direction penalty: 15 if 1h and 24h disagree (whipsaw)
   - Liquidity penalty: 20 if turnover <5%, 8 if <20%, 0 otherwise
   Sum capped at 100. */
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

/* ─── Liquidity ─── */
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

/* ─── Overall Risk Summary ─── */
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
    bg = 'bg-red-500/10 border-red-500/20'
    icon = <ShieldAlert className='h-4 w-4 text-red-500' />
  } else if (avgScore > 40) {
    level = 'High'
    color = 'text-orange-500'
    bg = 'bg-orange-500/10 border-orange-500/20'
    icon = <ShieldAlert className='h-4 w-4 text-orange-500' />
  } else if (avgScore > 20) {
    level = 'Moderate'
    color = 'text-amber-500'
    bg = 'bg-amber-500/10 border-amber-500/20'
    icon = <Shield className='h-4 w-4 text-amber-500' />
  } else {
    level = 'Low'
    color = 'text-emerald-500'
    bg = 'bg-emerald-500/10 border-emerald-500/20'
    icon = <ShieldCheck className='h-4 w-4 text-emerald-500' />
  }

  // Build detailed sentence
  const parts: string[] = []
  const h24 = change24h ?? 0

  // Volatility context
  if (volTrend.label === 'Escalating') {
    parts.push('price swings are intensifying rapidly')
  } else if (volTrend.label === 'Rising') {
    parts.push('volatility is picking up')
  } else if (volTrend.label === 'Cooling') {
    parts.push('volatility is settling down')
  } else if (volTrend.label === 'Cool') {
    parts.push('price action is calm')
  }

  // Momentum context
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
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  color = 'text-muted-foreground',
  tooltip,
  isLoading = false,
}: MetricCardProps) {
  return (
    <div className='bg-card p-3 rounded-md space-y-1'>
      <div className='flex items-center gap-1.5'>
        <span className={color}>{icon}</span>
        <span className='text-xs text-muted-foreground uppercase font-semibold tracking-wide'>
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-3 w-3 text-muted-foreground' />
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
          <Skeleton className='h-7 w-24 rounded-sm' />
          <Skeleton className='h-3 w-32 rounded-sm' />
        </>
      ) : (
        <>
          <div className='text-lg font-bold leading-tight'>{value}</div>
          {sub && <div className='text-xs text-muted-foreground'>{sub}</div>}
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
    <div className='space-y-3'>
      <div className='flex items-center gap-2 h-6'>
        <AlertTriangle className='h-4 w-4 text-amber-500' />
        <h4 className='text-sm font-semibold uppercase tracking-wider'>
          Risk Now
        </h4>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          label='Volatility Trend'
          value={
            volTrend ? (
              <span className={volTrend.color}>{volTrend.label}</span>
            ) : undefined
          }
          sub={volTrend?.sub}
          icon={<Wind className='h-3.5 w-3.5' />}
          color={volTrend?.color}
          tooltip='Compares 1h vs 24h vs 7d average daily change. Escalating = recent swings are bigger than usual = higher risk. Minimum 1% threshold to avoid stablecoin noise.'
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
          tooltip='24h change vs average daily 7d change. Surging/Collapsing = momentum is extreme. Decelerating = move is losing steam. Flat = 7d change is near zero (stablecoin-like).'
          isLoading={isLoading}
        />

        <MetricCard
          label='Market Stress'
          value={
            stress ? (
              <span className={stress.color}>{stress.label}</span>
            ) : undefined
          }
          sub={stress?.sub}
          icon={<Flame className='h-3.5 w-3.5' />}
          color={stress?.color}
          tooltip='Transparent formula: |24h|×3 + |1h|×4 + directionPenalty(15) + liquidityPenalty(8-20). 0-100 scale. Higher = more uncertainty.'
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

      {!isLoading && summary && (
        <div className={`rounded-md border p-3 space-y-2 ${summary.bg}`}>
          <div className='flex items-center gap-2'>
            {summary.icon}
            <span
              className={`text-xs font-bold uppercase tracking-wider ${summary.color}`}
            >
              {summary.level} Risk
            </span>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            {summary.text}
          </p>
        </div>
      )}

      {isLoading && (
        <div className='rounded-md border p-3 space-y-2 bg-card'>
          <Skeleton className='h-4 w-28 rounded-sm' />
          <Skeleton className='h-4 w-full rounded-sm' />
          <Skeleton className='h-4 w-4/5 rounded-sm' />
        </div>
      )}
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
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-blue-500' />
          <h4 className='text-sm font-semibold uppercase tracking-wider'>
            Period Analysis
          </h4>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-6 text-xs gap-1 px-2'
              disabled={isLoading}
            >
              {PERIOD_LABELS[days] || days}
              <ChevronDown className='h-3 w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-20'>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onDaysChange(value)}
                className={`text-xs px-2 py-1 rounded-sm cursor-pointer ${
                  days === value ? 'bg-accent' : ''
                }`}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          label='Period Return'
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
          label='Period Swing'
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
          tooltip='How much price bounced around during the period. Lower = more stable.'
          isLoading={isLoading}
        />

        <MetricCard
          label='Max Drawdown'
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
          tooltip='Largest drop from a peak to a trough within the period. Smaller = safer.'
          isLoading={isLoading}
        />

        <MetricCard
          label='vs Period Avg'
          value={
            vsAvg !== null ? (
              <span className={getRiskColor(vsAvg, 'higher-is-better')}>
                {vsAvg >= 0 ? '+' : ''}
                {vsAvg.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='current vs average'
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

      {/* Period prices info */}
      <div className='bg-card p-3 rounded-md space-y-1.5'>
        <div className='flex justify-between text-xs'>
          <span className='text-muted-foreground'>Period open</span>
          {isLoading ? (
            <Skeleton className='h-3.5 w-20 rounded-sm' />
          ) : (
            <span className='font-mono'>
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
            <Skeleton className='h-3.5 w-20 rounded-sm' />
          ) : (
            <span className='font-mono'>
              $
              {prices?.[prices.length - 1]?.value.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              }) || '—'}
            </span>
          )}
        </div>
        <div className='flex justify-between text-xs'>
          <span className='text-muted-foreground'>Period average</span>
          {isLoading ? (
            <Skeleton className='h-3.5 w-20 rounded-sm' />
          ) : (
            <span className='font-mono'>
              $
              {avgPrice?.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              }) || '—'}
            </span>
          )}
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
      <div className='rounded-lg border p-4 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h3 className='text-md font-bold uppercase tracking-wide flex items-center gap-2'>
            <Gauge className='h-5 w-5' />
            Risk Metrics & Analytics
          </h3>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <CoinRiskNow coin={coin} isLoading={isLoadingCoin} />
          <CoinPeriodAnalysis
            coin={coin}
            chart={chart}
            days={days}
            onDaysChange={onDaysChange}
            isLoading={isLoadingChart}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
