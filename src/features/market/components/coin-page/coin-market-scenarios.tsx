import { useMemo, useState } from 'react'
import {
  Rocket,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Gauge,
  Clock3,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { Coin } from '@/features/market/types/coin'

interface CoinMarketScenariosProps {
  coin: Coin | undefined
  isLoading: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (!isFinite(n) || n <= 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

function formatPercent(n: number): string {
  if (!isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : '−'
  return `${sign}${Math.abs(n).toFixed(1)}%`
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stddev(values: number[]) {
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

function getVolatilityProfile(volatility: number) {
  if (volatility < 12) return { label: 'Stable', level: 'low' as const }
  if (volatility < 30) return { label: 'Moderate', level: 'medium' as const }
  return { label: 'Volatile', level: 'high' as const }
}

// ─── Market Model ─────────────────────────────────────────────────

function buildScenarios(params: {
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

// ─── Component ────────────────────────────────────────────────────

const INVESTMENT_PRESETS = [500, 1000, 2500, 5000, 10000, 25000]
const HORIZON_PRESETS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
  { label: '3Y', months: 36 },
]

const SCENARIO_META = {
  bear: {
    tooltip:
      'Models a risk-off market with declining liquidity and expanding BTC dominance. Uses historical bear market drawdowns scaled by current volatility.',
  },
  base: {
    tooltip:
      'Models normal market continuation based on historical median performance for this market cap tier. Most statistically probable outcome.',
  },
  bull: {
    tooltip:
      'Models euphoric bull cycle with aggressive capital inflows and speculative momentum. Based on historical bull run peaks for this tier.',
  },
} as const

const COLUMN_TOOLTIPS = {
  scenario: 'Three market regimes based on historical behavior patterns',
  priceRange: 'Projected price range relative to current price.',
  valueRange: 'Portfolio value range based on your investment.',
  roiRange: 'Return on investment range for the selected period',
  probability:
    'Statistical confidence based on data quality, market cap tier, and time horizon',
} as const

export function CoinMarketScenarios({
  coin,
  isLoading,
}: CoinMarketScenariosProps) {
  const [investment, setInvestment] = useState('1000')
  const [months, setMonths] = useState(12)
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)

  const marketData = coin?.market_data
  const currentPrice = marketData?.current_price?.usd || 0
  const marketCap = marketData?.market_cap?.usd || 0
  const volume = marketData?.total_volume?.usd || 0
  const ath = marketData?.ath?.usd || 0
  const athDistance = ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0

  const p24 = marketData?.price_change_percentage_24h_in_currency?.usd || 0
  const p7 = marketData?.price_change_percentage_7d_in_currency?.usd || 0
  const p30 = marketData?.price_change_percentage_30d_in_currency?.usd || 0
  const p1y = marketData?.price_change_percentage_1y_in_currency?.usd || 0

  const volatility = useMemo(() => stddev([p24, p7, p30]), [p24, p7, p30])
  const trendScore = useMemo(
    () => p7 * 0.2 + p30 * 0.5 + p1y * 0.3,
    [p7, p30, p1y],
  )
  const investNum = parseFloat(investment) || 0

  const scenarios = useMemo(
    () =>
      buildScenarios({
        currentPrice,
        investment: investNum,
        months,
        marketCap,
        volume,
        trendScore,
        volatility,
        athDistance,
      }),
    [
      currentPrice,
      investNum,
      months,
      marketCap,
      volume,
      trendScore,
      volatility,
      athDistance,
    ],
  )

  const volProfile = getVolatilityProfile(volatility)
  const isLoadingAny = isLoading || !coin?.market_data

  const getPriceColor = (price: number) =>
    price >= currentPrice ? 'text-emerald-500' : 'text-red-500'
  const getValueColor = (value: number) =>
    value >= investNum ? 'text-emerald-500' : 'text-red-500'
  const getProbabilityColor = (conf: number) => {
    if (conf >= 70)
      return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
    if (conf >= 40)
      return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
    return 'text-red-500 border-red-500/30 bg-red-500/10'
  }

  return (
    <div className='rounded-lg border bg-background p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Rocket className='h-4 w-4 shrink-0' />
          <h2 className='text-lg font-semibold uppercase tracking-wide'>
            Market Scenarios
          </h2>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <p className='text-xs leading-relaxed'>
                  Probabilistic modeling based on market cap tier, volatility,
                  liquidity, trend strength, and historical recovery behavior.
                  Not price prediction.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Inputs */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm text-muted-foreground font-medium'>
            Investment ($)
          </label>
          {isLoadingAny ? (
            <Skeleton className='h-9 w-full rounded-2xl' />
          ) : (
            <Input
              type='number'
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className='h-9 font-mono text-sm rounded-2xl'
            />
          )}
          <div className='flex flex-wrap gap-1'>
            {INVESTMENT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={investment === String(preset) ? 'default' : 'outline'}
                size='sm'
                className='h-6 text-xs px-2 font-mono'
                onClick={() => setInvestment(String(preset))}
                disabled={isLoadingAny}
              >
                ${preset >= 1000 ? `${preset / 1000}k` : preset}
              </Button>
            ))}
          </div>
        </div>

        <div className=''>
          <div className='flex items-center justify-between'>
            <label className='text-sm text-muted-foreground font-medium flex items-center gap-1'>
              <Clock3 className='h-3 w-3' />
              Investment Period
            </label>
            <span className='font-mono text-sm font-semibold text-primary'>
              {isLoadingAny ? (
                <Skeleton className='h-4 w-12 inline-block' />
              ) : (
                `${months} months`
              )}
            </span>
          </div>
          {isLoadingAny ? (
            <Skeleton className='h-8 w-full' />
          ) : (
            <Slider
              className='h-12'
              value={[months]}
              onValueChange={(v) => setMonths(v[0])}
              min={1}
              max={36}
              step={1}
            />
          )}
          <div className='flex flex-wrap gap-1'>
            {HORIZON_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={months === preset.months ? 'default' : 'outline'}
                size='sm'
                className='h-6 text-xs px-2'
                onClick={() => setMonths(preset.months)}
                disabled={isLoadingAny}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-2 gap-2'>
        {/* Volatility */}
        <div className='flex items-center justify-between rounded-md bg-sidebar px-4 py-2.5'>
          <div className='flex items-center gap-1.5'>
            <Gauge className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>Volatility</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 text-muted-foreground cursor hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    Standard deviation of 24h, 7d, and 30d price changes. Higher
                    = more unpredictable swings.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isLoadingAny ? (
            <Skeleton className='h-5 w-14' />
          ) : (
            <Badge
              variant='outline'
              className={`text-xs h-5 px-2 font-mono ${
                volProfile.level === 'low'
                  ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                  : volProfile.level === 'high'
                    ? 'text-red-500 border-red-500/20 bg-red-500/5'
                    : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
              }`}
            >
              {volatility.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Trend */}
        <div className='flex items-center justify-between rounded-md bg-sidebar px-4 py-2.5'>
          <div className='flex items-center gap-1.5'>
            <Activity className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>Trend</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 text-muted-foreground cursor hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    Weighted momentum: 20% × 7d + 50% × 30d + 30% × 1y change.
                    Positive = upward momentum across timeframes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isLoadingAny ? (
            <Skeleton className='h-5 w-14' />
          ) : (
            <Badge
              variant='outline'
              className={`text-xs h-5 px-2 font-mono ${
                trendScore > 0
                  ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                  : trendScore < 0
                    ? 'text-red-500 border-red-500/20 bg-red-500/5'
                    : 'text-muted-foreground border-muted-foreground/20'
              }`}
            >
              {formatPercent(trendScore)}
            </Badge>
          )}
        </div>
      </div>

      {/* Risk Profile */}
      <div className='flex items-center justify-between rounded-md bg-sidebar px-4 py-2.5'>
        <div className='flex items-center gap-2'>
          <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          <div>
            <p className='text-sm font-medium'>Risk Profile</p>
            <p className='text-xs text-muted-foreground'>
              Based on historical volatility
            </p>
          </div>
        </div>
        {isLoadingAny ? (
          <Skeleton className='h-5 w-16' />
        ) : (
          <Badge
            variant='outline'
            className={`text-xs h-5 px-2 ${
              volProfile.level === 'low'
                ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                : volProfile.level === 'high'
                  ? 'text-red-500 border-red-500/20 bg-red-500/5'
                  : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
            }`}
          >
            {volProfile.label}
          </Badge>
        )}
      </div>

      {/* Scenarios Table */}
      <div className='rounded-md border overflow-hidden'>
        {/* Header */}
        <div className='grid grid-cols-[180px_1fr_1fr_1fr_100px] gap-3 px-4 py-2.5 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider'>
          <div className='flex items-center gap-1'>
            <span>Scenario</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 cursor hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    {COLUMN_TOOLTIPS.scenario}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <span>Price Range</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 cursor hover:text-foreground transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    {COLUMN_TOOLTIPS.priceRange}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <span>Value Range</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 cursor hover:text-foreground transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    {COLUMN_TOOLTIPS.valueRange}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <span>ROI Range</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 cursor hover:text-foreground transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    {COLUMN_TOOLTIPS.roiRange}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <span>Prob.</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3 w-3 cursor hover:text-foreground transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='text-xs leading-relaxed'>
                    {COLUMN_TOOLTIPS.probability}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Rows */}
        {isLoadingAny
          ? [
              {
                label: 'Bear Market',
                desc: 'Risk-off environment',
                color: 'red',
                icon: TrendingDown,
                meta: SCENARIO_META.bear,
              },
              {
                label: 'Base Case',
                desc: 'Normal continuation',
                color: 'blue',
                icon: Target,
                meta: SCENARIO_META.base,
              },
              {
                label: 'Bull Cycle',
                desc: 'Euphoric expansion',
                color: 'emerald',
                icon: TrendingUp,
                meta: SCENARIO_META.bull,
              },
            ].map((s, i) => {
              const Icon = s.icon
              const iconColor =
                s.color === 'red'
                  ? 'text-red-500'
                  : s.color === 'emerald'
                    ? 'text-emerald-500'
                    : 'text-blue-500'
              const borderColor =
                s.color === 'red'
                  ? 'border-l-2 border-l-red-500/50'
                  : s.color === 'emerald'
                    ? 'border-l-2 border-l-emerald-500/50'
                    : 'border-l-2 border-l-blue-500/50'

              return (
                <div
                  key={i}
                  className={`grid grid-cols-[180px_1fr_1fr_1fr_100px] gap-3 px-4 py-3 border-b border-border/50 items-center ${borderColor}`}
                >
                  <div className='flex items-center gap-2'>
                    <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold truncate'>
                          {s.label}
                        </span>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className='h-3 w-3 text-muted-foreground cursor hover:text-foreground transition-colors shrink-0' />
                            </TooltipTrigger>
                            <TooltipContent side='top' className='max-w-xs'>
                              <p className='text-xs leading-relaxed'>
                                {s.meta.tooltip}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {s.desc}
                      </span>
                    </div>
                    <ChevronDown className='h-3 w-3 text-muted-foreground shrink-0 ml-auto' />
                  </div>
                  <Skeleton className='h-4 w-20 ml-auto' />
                  <Skeleton className='h-4 w-20 ml-auto' />
                  <Skeleton className='h-4 w-20 ml-auto' />
                  <Skeleton className='h-5 w-16 ml-auto' />
                </div>
              )
            })
          : scenarios.map((s) => {
              const Icon = s.icon
              const meta = SCENARIO_META[s.type]
              const borderColor =
                s.color === 'red'
                  ? 'border-l-2 border-l-red-500/50'
                  : s.color === 'emerald'
                    ? 'border-l-2 border-l-emerald-500/50'
                    : 'border-l-2 border-l-blue-500/50'
              const iconColor =
                s.color === 'red'
                  ? 'text-red-500'
                  : s.color === 'emerald'
                    ? 'text-emerald-500'
                    : 'text-blue-500'
              const isExpanded = expandedScenario === s.type

              return (
                <div key={s.type}>
                  <div
                    className={`grid grid-cols-[180px_1fr_1fr_1fr_100px] gap-3 px-4 py-3 border-b border-border/50 items-center hover:bg-muted/20 transition-colors cursor-pointer ${borderColor}`}
                    onClick={() =>
                      setExpandedScenario(isExpanded ? null : s.type)
                    }
                  >
                    {/* Scenario */}
                    <div className='flex items-center gap-2'>
                      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                      <div className='flex flex-col min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-semibold truncate'>
                            {s.label}
                          </span>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='h-3 w-3 text-muted-foreground cursor hover:text-foreground transition-colors shrink-0' />
                              </TooltipTrigger>
                              <TooltipContent side='top' className='max-w-xs'>
                                <p className='text-xs leading-relaxed'>
                                  {meta.tooltip}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          {s.desc}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Price Range */}
                    <div className='text-right space-y-0.5'>
                      <p className='text-sm font-mono font-semibold'>
                        <span className={getPriceColor(s.lowPrice)}>
                          {formatCurrency(s.lowPrice)}
                        </span>
                        <span className='text-muted-foreground mx-1'>→</span>
                        <span className={getPriceColor(s.highPrice)}>
                          {formatCurrency(s.highPrice)}
                        </span>
                      </p>
                    </div>

                    {/* Value Range */}
                    <div className='text-right space-y-0.5'>
                      <p className='text-sm font-mono font-semibold'>
                        <span className={getValueColor(s.lowValue)}>
                          {formatCurrency(s.lowValue)}
                        </span>
                        <span className='text-muted-foreground mx-1'>→</span>
                        <span className={getValueColor(s.highValue)}>
                          {formatCurrency(s.highValue)}
                        </span>
                      </p>
                    </div>

                    {/* ROI Range */}
                    <div className='text-right space-y-0.5'>
                      <p
                        className={`text-sm font-mono font-semibold ${s.lowReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                      >
                        {formatPercent(s.lowReturn)}
                        <span className='text-muted-foreground mx-1'>→</span>
                        {formatPercent(s.highReturn)}
                      </p>
                    </div>

                    {/* Probability */}
                    <div className='text-right'>
                      <Badge
                        variant='outline'
                        className={`text-xs font-mono h-6 px-2 ${getProbabilityColor(s.confidence)}`}
                      >
                        {s.confidence}%
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded Drivers */}
                  {isExpanded && (
                    <div className='px-4 py-3 bg-muted/30 border-b border-border/50 space-y-2'>
                      <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        Main Drivers
                      </p>
                      <div className='space-y-1'>
                        {s.drivers.map((driver, i) => (
                          <div
                            key={i}
                            className='flex items-center gap-2 text-xs text-muted-foreground'
                          >
                            <ChevronRight className='h-3 w-3 shrink-0 text-muted-foreground/50' />
                            <span>{driver}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
      </div>

      {/* Disclaimer */}
      <div className='rounded-md bg-muted/40 p-2.5'>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          <span className='font-semibold'>Disclaimer:</span> Probabilistic
          simulations based on market structure and historical behavior. Not
          financial advice. Reliability decreases beyond 24 months.
        </p>
      </div>
    </div>
  )
}
