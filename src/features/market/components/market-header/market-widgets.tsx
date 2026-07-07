import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { GlobalData } from '@/features/market/types/global'
import {
  useCoinMarketChart,
  useFearGreed,
} from '@/features/market/hooks/coins-queries'
import { useCurrency } from '@/features/currency/hooks'
import { useTheme } from '@/shared/lib/theme-provider'
import { getChartColors } from '@/shared/lib/chart-config'

interface MarketWidgetsProps {
  data: GlobalData | undefined
  isLoading: boolean
}

function Sparkline({
  data,
  color,
  height = 44,
}: {
  data: number[]
  color: string
  height?: number
}) {
  if (!data || data.length < 2) return <div style={{ height }} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 75 - 12.5
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`
  const areaD = `${pathD} L 100,100 L 0,100 Z`
  const gradId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
      className='w-full hidden sm:block'
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity='0.3' />
          <stop offset='100%' stopColor={color} stopOpacity='0.02' />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill='none'
        stroke={color}
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function WidgetCard({
  title,
  value,
  change,
  mutedChange,
  sparkline,
  isLoading,
}: {
  title: string
  value: string
  change?: number
  mutedChange?: string
  sparkline?: React.ReactNode
  isLoading: boolean
}) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className='flex-1 min-w-0 rounded-xl p-1 min-[420px]:p-3 py-3 sm:p-4 lg:px-5 lg:py-3 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='text-xs sm:text-sm text-muted-foreground capitalize font-semibold mb-1'>
          {title}
        </span>
      </div>

      {/* Value row - column on mobile, row on sm+ */}
      <div className='flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-1'>
        {isLoading ? (
          <>
            <Skeleton className='h-5 sm:h-6 w-18 mb-2' />
            <Skeleton className='h-3 w-16' />
          </>
        ) : (
          <span className='text-base sm:text-xl font-bold font-mono tracking-tight'>
            {value}
          </span>
        )}

        {/* Colored change (for Market Cap) */}
        {!isLoading && change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium ${
              isPositive
                ? 'text-emerald-500'
                : isNegative
                  ? 'text-red-400'
                  : 'text-muted-foreground'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className='h-3.5 w-3.5' />
            ) : isNegative ? (
              <ArrowDownRight className='h-3.5 w-3.5' />
            ) : (
              <Minus className='h-3.5 w-3.5' />
            )}
            {Math.abs(change).toFixed(2)}%
          </span>
        )}

        {/* Muted text (for Volume) */}
        {!isLoading && mutedChange && (
          <span className='inline-flex  items-center  text-xs font-normal sm:font-mono text-muted-foreground'>
            {mutedChange}
          </span>
        )}
      </div>

      {/* Sparkline - hidden on mobile */}
      {isLoading ? (
        <Skeleton className='hidden sm:block h-14 w-full mt-2' />
      ) : (
        sparkline
      )}
    </div>
  )
}

function DominanceWidget({
  btcDominance,
  ethDominance,
  isLoading,
}: {
  btcDominance: number
  ethDominance: number
  isLoading: boolean
}) {
  const others = Math.max(0, 100 - btcDominance - ethDominance)

  return (
    <div className='flex-1 min-w-0 rounded-xl p-1 min-[420px]:p-3 py-3 sm:p-4 lg:px-5 lg:py-3 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      {/* Header */}
      <div className='flex items-center justify-between mb-1 sm:min-h-5'>
        <span className='text-xs sm:text-sm text-muted-foreground capitalize font-medium whitespace-nowrap'>
          Dominance
        </span>
      </div>
      {/* Value */}
      {isLoading ? (
        <Skeleton className='h-5 sm:h-6 w-14 sm:w-20 mb-1' />
      ) : (
        <div className='flex items-baseline gap-2 mb-1'>
          <span className='text-base sm:text-xl font-bold font-mono tracking-tight'>
            {btcDominance.toFixed(1)}%
          </span>
          <span className='text-xs text-muted-foreground font-mono hidden sm:inline'>
            BTC
          </span>
        </div>
      )}
      {/* Bar + labels - labels hidden on mobile */}
      {isLoading ? (
        <div className='mt-3 space-y-2'>
          <Skeleton className='h-3 w-full' />
          <div className='hidden sm:flex justify-between'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-3 w-14' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      ) : (
        <div className='mt-1.5 sm:mt-3'>
          <div className='flex h-2 rounded-full overflow-hidden'>
            <div
              className='bg-amber-500'
              style={{ width: `${btcDominance}%` }}
            />
            <div
              className='bg-violet-500'
              style={{ width: `${ethDominance}%` }}
            />
            <div className='bg-muted flex-1' />
          </div>
          <div className='hidden sm:flex justify-between mt-2 text-xs text-muted-foreground font-mono'>
            <span className='text-amber-500'>
              BTC {btcDominance.toFixed(1)}%
            </span>
            <span className='text-violet-400'>
              ETH {ethDominance.toFixed(1)}%
            </span>
            <span>Others {others.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

function FearGreedWidget({
  value,
  label,
  isLoading,
}: {
  value: number
  label: string
  isLoading: boolean
}) {
  const cx = 60
  const cy = 60
  const r = 55

  const angle = 180 - (value / 100) * 180
  const rad = (angle * Math.PI) / 180
  const px = cx + r * Math.cos(rad)
  const py = cy - r * Math.sin(rad)

  // 5 segments, each 30° + 6° gap = 180°
  const arcPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy - r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy - r * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const segments = [
    { path: arcPath(180, 150), color: '#ef4444' },
    { path: arcPath(142.5, 112.5), color: '#f97316' },
    { path: arcPath(105, 75), color: '#facc15' },
    { path: arcPath(67.5, 37.5), color: '#84cc16' },
    { path: arcPath(30, 0), color: '#10b981' },
  ]

  return (
    <div className='flex-1 min-w-0 rounded-xl p-1 min-[420px]:p-3 py-3 sm:p-4 lg:px-5 lg:py-3 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-xs sm:text-sm text-muted-foreground capitalize font-medium whitespace-nowrap'>
          Fear & Greed
        </span>
      </div>

      {isLoading ? (
        <div className='flex flex-col items-center gap-2'>
          <Skeleton className='h-10 sm:h-20 w-16 sm:w-32' />
        </div>
      ) : (
        <div className='flex flex-col items-center relative'>
          <svg
            viewBox='0 0 120 70'
            className='w-full max-w-30 sm:max-w-35 h-auto'
          >
            {segments.map((seg, i) => (
              <path
                key={i}
                d={seg.path}
                fill='none'
                stroke={seg.color}
                strokeWidth='6'
                strokeLinecap='round'
              />
            ))}
            <circle
              cx={px}
              cy={py}
              r='4.5'
              fill='white'
              stroke='white'
              strokeWidth='1.5'
            />
          </svg>

          {/* Value + Label */}
          <div className='flex flex-col items-center -mt-5 sm:-mt-10'>
            <span className='text-base sm:text-2xl font-bold font-mono text-foreground leading-none'>
              {value}
            </span>
            <span className='hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground capitalize tracking-wider text-center'>
              {label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function MarketWidgets({ data, isLoading }: MarketWidgetsProps) {
  const { format, currency } = useCurrency()
  const { theme } = useTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  const colors = getChartColors(isDark)

  const totalMcap =
    data?.total_market_cap?.[currency] ?? data?.total_market_cap?.usd ?? 0
  const totalVolume =
    data?.total_volume?.[currency] ?? data?.total_volume?.usd ?? 0
  const btcDominance = data?.market_cap_percentage?.btc ?? 0
  const ethDominance = data?.market_cap_percentage?.eth ?? 0
  const marketChange = data?.market_cap_change_percentage_24h_usd ?? 0

  const { data: btcChart } = useCoinMarketChart('bitcoin', '7', currency)
  const { data: fngData, isLoading: fngLoading } = useFearGreed()

  const mcapSparkline = btcChart?.prices?.map(([, price]) => price) ?? []
  const volumeSparkline = btcChart?.total_volumes?.map(([, vol]) => vol) ?? []

  const mcapColor = marketChange >= 0 ? colors.negative : colors.negative
  const volColor = '#2563eb'

  const volMcapRatio =
    totalMcap > 0 && totalVolume > 0
      ? `${((totalVolume / totalMcap) * 100).toFixed(1)}%`
      : undefined

  return (
    <div className='grid grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-3'>
      <WidgetCard
        title='Market Cap'
        value={format(totalMcap, { notation: 'compact' })}
        change={marketChange}
        sparkline={
          mcapSparkline.length > 1 ? (
            <Sparkline data={mcapSparkline} color={mcapColor} height={60} />
          ) : null
        }
        isLoading={isLoading}
      />

      <WidgetCard
        title='24h Volume'
        value={format(totalVolume, { notation: 'compact' })}
        mutedChange={volMcapRatio ? `${volMcapRatio} Mcap` : undefined}
        sparkline={
          volumeSparkline.length > 1 ? (
            <Sparkline data={volumeSparkline} color={volColor} height={60} />
          ) : null
        }
        isLoading={isLoading}
      />

      <DominanceWidget
        btcDominance={btcDominance}
        ethDominance={ethDominance}
        isLoading={isLoading}
      />

      <FearGreedWidget
        value={fngData?.value ?? 0}
        label={fngData?.value_classification ?? '—'}
        isLoading={isLoading || fngLoading}
      />
    </div>
  )
}
