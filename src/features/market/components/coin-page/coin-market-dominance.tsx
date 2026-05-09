import {
  Globe,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  Layers,
  Activity,
  Target,
  Droplets,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '@/features/market/types/coin'
import type { GlobalData } from '@/features/market/types/global'
import { Badge } from '@/shared/ui/badge'

interface CoinMarketDominanceProps {
  coin: Coin | undefined
  isLoading: boolean
  globalData?: GlobalData | null
}

function formatCompact(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (Math.abs(n) >= 1_000_000_000_000)
    return (n / 1_000_000_000_000).toFixed(2) + 'T'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatCurrency(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

// === DOMINANCE RING ===
function DominanceCircleDiagram({
  coinDominance,
  btcDominance,
  size = 110,
  isLoading = false,
  isBitcoin = false,
}: {
  coinDominance: number
  btcDominance: number
  size?: number
  isLoading?: boolean
  isBitcoin?: boolean
}) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const coinArcRaw = (Math.min(coinDominance, 100) / 100) * circumference
  const coinArc = Math.max(coinArcRaw, 3)

  const btcArcRaw = (Math.min(btcDominance, 100) / 100) * circumference
  const btcArc = Math.max(btcArcRaw, 3)

  const coinAngle = (coinDominance / 100) * 360

  const colorBg = '#3f3f46'
  const colorCoin = 'oklch(0.7 0.15 162)'
  const colorBtc = 'oklch(0.65 0.12 162 / 0.35)'

  if (isLoading) {
    return (
      <div
        className='relative inline-flex items-center justify-center shrink-0'
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className='-rotate-90'>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 10) / 2}
            fill='none'
            stroke={colorBg}
            strokeWidth={10}
          />
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-1'>
          <Skeleton className='h-5 w-14' />
          <Skeleton className='h-3 w-16' />
        </div>
      </div>
    )
  }

  return (
    <div
      className='relative inline-flex items-center justify-center shrink-0'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        {/* Фон — весь рынок */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorBg}
          strokeWidth={strokeWidth}
        />

        {/* Монета — от 0 (ярко-зелёная) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorCoin}
          strokeWidth={strokeWidth}
          strokeDasharray={`${coinArc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap='butt'
        />

        {/* BTC — начинается после монеты (тускло-зелёная), только если не BTC страница */}
        {!isBitcoin && btcDominance > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={colorBtc}
            strokeWidth={strokeWidth}
            strokeDasharray={`${btcArc} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap='butt'
            transform={`rotate(${coinAngle} ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-base font-bold font-mono'>
          {coinDominance < 0.01 ? '<0.01' : coinDominance.toFixed(2)}%
        </span>
        <span className='text-[9px] text-muted-foreground uppercase tracking-wider'>
          Market Share
        </span>
      </div>
    </div>
  )
}

// === METRIC CARD ===
function MetricCard({
  icon,
  label,
  value,
  subvalue,
  accent = false,
  warning = false,
  isLoading = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subvalue?: string
  accent?: boolean
  warning?: boolean
  isLoading?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-2.5 space-y-1 ${
        warning
          ? 'bg-orange-500/10 border border-orange-500/20'
          : accent
            ? 'bg-emerald-500/15 border border-emerald-500/30'
            : 'bg-sidebar'
      }`}
    >
      <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
        {icon}
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className='h-6 w-28' />
      ) : (
        <p
          className={`text-base font-semibold font-mono tracking-tight ${
            warning ? 'text-orange-500' : accent ? 'text-emerald-500' : ''
          }`}
        >
          {value}
        </p>
      )}
      {subvalue && (
        <p className='text-xs text-muted-foreground font-mono'>
          {isLoading ? (
            <Skeleton className='h-3 w-20 inline-block' />
          ) : (
            subvalue
          )}
        </p>
      )}
    </div>
  )
}

// === COMPARISON BAR ===
function ComparisonBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftPercent,
  color = 'primary',
  isLoading = false,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
  leftPercent: number
  color?: 'primary' | 'emerald' | 'orange'
  isLoading?: boolean
}) {
  const colors = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
  }

  if (isLoading) {
    return (
      <div className='space-y-1.5'>
        <div className='flex justify-between text-xs'>
          <div>
            <p className='font-medium text-[11px]'>{leftLabel}</p>
            <Skeleton className='h-3 w-24 mt-0.5' />
          </div>
          <div className='text-right'>
            <p className='font-medium text-[11px]'>{rightLabel}</p>
            <Skeleton className='h-3 w-24 mt-0.5 ml-auto' />
          </div>
        </div>
        <Skeleton className='h-2 w-full rounded-full' />
      </div>
    )
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex justify-between text-xs'>
        <div>
          <p className='font-medium text-[11px]'>{leftLabel}</p>
          <p className='font-mono text-xs text-muted-foreground'>{leftValue}</p>
        </div>
        <div className='text-right'>
          <p className='font-medium text-[11px]'>{rightLabel}</p>
          <p className='font-mono text-xs text-muted-foreground'>
            {rightValue}
          </p>
        </div>
      </div>
      <div className='h-2 bg-muted rounded-full overflow-hidden flex'>
        <div
          className={`${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(leftPercent, 100)}%` }}
        />
      </div>
    </div>
  )
}

function getDominanceLevel(dominance: number): {
  label: string
  color: string
} {
  if (dominance >= 10)
    return { label: 'Market Leader', color: 'bg-amber-500/20 text-amber-500' }
  if (dominance >= 1)
    return { label: 'Top Tier', color: 'bg-violet-500/20 text-violet-500' }
  if (dominance >= 0.1)
    return { label: 'Mid-Cap', color: 'bg-emerald-500/20 text-emerald-500' }
  if (dominance >= 0.01)
    return { label: 'Small Cap', color: 'bg-blue-500/20 text-blue-500' }
  return { label: 'Micro Cap', color: 'bg-slate-500/20 text-slate-500' }
}

const dominanceLegend = [
  { threshold: '≥10%', label: 'Market Leader', color: 'bg-amber-500' },
  { threshold: '≥1%', label: 'Top Tier', color: 'bg-violet-500' },
  { threshold: '≥0.1%', label: 'Mid-Cap', color: 'bg-emerald-500' },
  { threshold: '≥0.01%', label: 'Small Cap', color: 'bg-blue-500' },
  { threshold: '<0.01%', label: 'Micro Cap', color: 'bg-slate-500' },
]

export function CoinMarketDominance({
  coin,
  isLoading,
  globalData,
}: CoinMarketDominanceProps) {
  const marketData = coin?.market_data
  const symbol = coin?.symbol?.toUpperCase() || ''
  const isBitcoin = coin?.id === 'bitcoin'

  const mcap = marketData?.market_cap?.usd || 0
  const volume = marketData?.total_volume?.usd || 0

  // Global data
  const globalMcap = globalData?.total_market_cap?.usd || 0
  const globalVolume = globalData?.total_volume?.usd || 0
  const btcDominance = globalData?.market_cap_percentage?.btc || 0

  // Core metrics
  const coinDominance =
    mcap > 0 && globalMcap > 0 ? (mcap / globalMcap) * 100 : 0
  const btcMcap = globalMcap * (btcDominance / 100)
  const relativeToBtc = mcap > 0 && btcMcap > 0 ? (mcap / btcMcap) * 100 : 0
  const volumeShare =
    volume > 0 && globalVolume > 0 ? (volume / globalVolume) * 100 : 0

  // Relative Volume
  const coinVolRatio = mcap > 0 ? volume / mcap : 0
  const marketVolRatio = globalMcap > 0 ? globalVolume / globalMcap : 0
  const relativeVolume = marketVolRatio > 0 ? coinVolRatio / marketVolRatio : 0

  const isLoadingAny = isLoading || !globalData

  return (
    <div className='rounded-lg border bg-background p-3 space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            Market Dominance
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-default' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <div className='text-xs leading-relaxed space-y-1.5'>
                  <p>
                    Market cap of this asset divided by total crypto market cap,
                    expressed as a percentage.
                  </p>
                  <p className='text-muted-foreground'>
                    Higher values indicate greater market presence, liquidity,
                    and institutional adoption.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isLoadingAny ? (
          <Badge variant='secondary' className='text-xs h-5 px-2 font-mono'>
            <Skeleton className='h-3 w-12 inline-block' />
          </Badge>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium cursor-default ${getDominanceLevel(coinDominance).color}`}
                >
                  <Target className='h-3 w-3' />
                  <span>{getDominanceLevel(coinDominance).label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='max-w-55'>
                <div className='text-xs leading-relaxed space-y-1.5'>
                  <p className='font-semibold text-center'>Dominance Levels</p>
                  {dominanceLegend.map((item) => (
                    <div key={item.label} className='flex items-center gap-2'>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${item.color}`}
                      />
                      <span className='text-muted-foreground'>
                        {item.threshold}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Ring + Legend */}
      <div className='flex items-center gap-3'>
        <DominanceCircleDiagram
          coinDominance={coinDominance}
          btcDominance={btcDominance}
          size={110}
          isLoading={isLoadingAny}
          isBitcoin={isBitcoin}
        />
        <div className='flex-1 space-y-1.5'>
          {/* Coin */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div
                className='w-2.5 h-2.5 rounded-full'
                style={{ background: 'oklch(0.7 0.15 162)' }}
              />
              <span>{symbol || 'This Asset'}</span>
            </div>
            {isLoadingAny ? (
              <Skeleton className='h-4 w-24' />
            ) : (
              <span className='font-mono text-sm'>{formatCurrency(mcap)}</span>
            )}
          </div>

          {/* BTC — hide on Bitcoin page */}
          {!isBitcoin && (
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div
                  className='w-2.5 h-2.5 rounded-full'
                  style={{ background: 'oklch(0.65 0.12 162 / 0.35)' }}
                />
                <span className='text-muted-foreground'>Bitcoin</span>
              </div>
              {isLoadingAny ? (
                <Skeleton className='h-4 w-20' />
              ) : (
                <span className='font-mono text-sm text-muted-foreground'>
                  {formatCurrency(btcMcap)}
                </span>
              )}
            </div>
          )}

          {/* Rest of Market */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div
                className='w-2.5 h-2.5 rounded-full'
                style={{ background: '#3f3f46' }}
              />
              <span className='text-muted-foreground'>Rest of Market</span>
            </div>
            {isLoadingAny ? (
              <Skeleton className='h-4 w-20' />
            ) : (
              <span className='font-mono text-sm text-muted-foreground'>
                {formatCurrency(Math.max(0, globalMcap - mcap - btcMcap))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          icon={<Target className='h-3 w-3' />}
          label='Market Share'
          value={`${coinDominance < 0.01 ? '<0.01' : coinDominance.toFixed(2)}%`}
          subvalue={`of ${formatCompact(globalMcap)} total cap`}
          accent={coinDominance > 1}
          isLoading={isLoadingAny}
        />
        <MetricCard
          icon={<Activity className='h-3 w-3' />}
          label='Volume Share'
          value={`${volumeShare < 0.01 ? '<0.01' : volumeShare.toFixed(2)}%`}
          subvalue={`of ${formatCompact(globalVolume)} global vol`}
          accent={volumeShare > 1}
          isLoading={isLoadingAny}
        />
        <MetricCard
          icon={<Zap className='h-3 w-3' />}
          label='vs BTC'
          value={
            isBitcoin
              ? '100%'
              : `${relativeToBtc < 0.01 ? '<0.01' : relativeToBtc.toFixed(2)}%`
          }
          subvalue={
            isBitcoin
              ? 'Market leader'
              : `${(btcMcap / Math.max(mcap, 0.001)).toFixed(0)}x smaller`
          }
          accent={isBitcoin || relativeToBtc > 10}
          isLoading={isLoadingAny}
        />
        <MetricCard
          icon={<Droplets className='h-3 w-3' />}
          label='Relative Volume'
          value={relativeVolume > 0 ? `${relativeVolume.toFixed(2)}x` : '—'}
          subvalue={
            relativeVolume > 3
              ? 'Very active trading'
              : relativeVolume > 1
                ? 'Active trading'
                : relativeVolume > 0.5
                  ? 'Moderate activity'
                  : relativeVolume > 0
                    ? 'Low activity'
                    : 'No data'
          }
          accent={relativeVolume > 1}
          warning={relativeVolume > 0 && relativeVolume < 0.3}
          isLoading={isLoadingAny}
        />
      </div>

      {/* Comparison Bar — монета vs BTC */}
      {!isBitcoin && (
        <ComparisonBar
          leftLabel={symbol || 'This Asset'}
          leftValue={formatCurrency(mcap)}
          rightLabel='Bitcoin'
          rightValue={formatCurrency(btcMcap)}
          leftPercent={relativeToBtc}
          color={
            relativeToBtc > 10
              ? 'emerald'
              : relativeToBtc > 1
                ? 'primary'
                : 'orange'
          }
          isLoading={isLoadingAny}
        />
      )}

      {isBitcoin && !isLoadingAny && (
        <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5'>
          <div className='flex items-center gap-1'>
            <ArrowUpRight className='w-4 h-4 text-emerald-500 shrink-0' />
            <p className='font-semibold text-emerald-500 text-sm'>
              Market Leader
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed mt-1'>
            Bitcoin commands {coinDominance.toFixed(1)}% of the total crypto
            market cap.
          </p>
        </div>
      )}

      {/* Warning for smaller coins */}
      {!isBitcoin && !isLoadingAny && coinDominance < 0.01 && (
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5'>
          <div className='flex items-center gap-2'>
            <ArrowDownRight className='w-4 h-4 text-orange-500 shrink-0' />
            <p className='font-semibold text-orange-500 text-sm'>
              Low Market Presence
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed pl-6 mt-1'>
            Less than 0.01% of total crypto market. Higher risk due to low
            liquidity and market depth.
          </p>
        </div>
      )}

      <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2'>
        {isLoadingAny ? (
          <>
            <span className='flex items-center gap-1'>
              <BarChart3 className='h-3 w-3' />
              Total MCAP: <Skeleton className='h-3 w-16 inline-block' />
            </span>
            <span className='flex items-center gap-1'>
              <Layers className='h-3 w-3' />
              24h Vol: <Skeleton className='h-3 w-16 inline-block' />
            </span>
            <span className='flex items-center gap-1'>
              <Zap className='h-3 w-3' />
              BTC Dom: <Skeleton className='h-3 w-12 inline-block' />
            </span>
          </>
        ) : (
          <>
            <span className='flex items-center gap-1'>
              <BarChart3 className='h-3 w-3' />
              Total MCAP:{' '}
              <span className='font-mono text-foreground'>
                {formatCompact(globalMcap)}
              </span>
            </span>
            <span className='flex items-center gap-1'>
              <Layers className='h-3 w-3' />
              24h Vol:{' '}
              <span className='font-mono text-foreground'>
                {formatCompact(globalVolume)}
              </span>
            </span>
            <span className='flex items-center gap-1'>
              <Zap className='h-3 w-3' />
              BTC Dom:{' '}
              <span className='font-mono text-foreground'>
                {btcDominance.toFixed(1)}%
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  )
}
