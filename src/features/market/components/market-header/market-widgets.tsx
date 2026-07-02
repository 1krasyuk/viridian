import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { GlobalData } from '@/features/market/types/global'
import { useCoinMarketChart } from '@/features/market/hooks/coins-queries'
import { useCurrency } from '@/features/currency/hooks'
import { useTheme } from 'next-themes'
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
    <div className='flex-1 min-w-0 rounded-xl p-3 sm:p-4 lg:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
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
            <Skeleton className='h-5 sm:h-6 w-18' />
            <Skeleton className='h-2.5 sm:h-3 w-16' />
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
                  ? 'text-red-500'
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
        <Skeleton className='hidden sm:block h-14 lg:h-18 w-full mt-2' />
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
    <div className='flex-1 min-w-0 rounded-xl p-3 sm:p-4 lg:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      {/* Header */}
      <div className='flex items-center justify-between mb-1 min-h-8'>
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

function StatsWidget({
  activeCoins,
  markets,
  isLoading,
}: {
  activeCoins: number
  markets: number
  isLoading: boolean
}) {
  return (
    <div className='flex-1 min-w-0 rounded-xl p-3 sm:p-4 lg:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-xs sm:text-sm text-muted-foreground capitalize font-medium'>
          Market Overview
        </span>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div>
          {isLoading ? (
            <Skeleton className='h-5 sm:h-6 w-14 sm:w-20 mb-1' />
          ) : (
            <p className='text-base sm:text-lg lg:text-xl font-bold font-mono tracking-tight'>
              {activeCoins.toLocaleString()}
            </p>
          )}
          <p className='text-xs text-muted-foreground capitalize'>Coins</p>
        </div>
        <div className='hidden sm:block'>
          {isLoading ? (
            <Skeleton className='h-5 sm:h-6 w-16 mb-1' />
          ) : (
            <p className='text-base sm:text-lg lg:text-xl font-bold font-mono tracking-tight'>
              {markets.toLocaleString()}
            </p>
          )}
          <p className='text-xs text-muted-foreground capitalize'>Markets</p>
        </div>
      </div>
    </div>
  )
}

export function MarketWidgets({ data, isLoading }: MarketWidgetsProps) {
  const { format, currency } = useCurrency()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = getChartColors(isDark)

  const totalMcap =
    data?.total_market_cap?.[currency] ?? data?.total_market_cap?.usd ?? 0
  const totalVolume =
    data?.total_volume?.[currency] ?? data?.total_volume?.usd ?? 0
  const btcDominance = data?.market_cap_percentage?.btc ?? 0
  const ethDominance = data?.market_cap_percentage?.eth ?? 0
  const marketChange = data?.market_cap_change_percentage_24h_usd ?? 0
  const activeCoins = data?.active_cryptocurrencies ?? 0
  const markets = data?.markets ?? 0

  const { data: btcChart } = useCoinMarketChart('bitcoin', '7', currency)

  const mcapSparkline = btcChart?.prices?.map(([, price]) => price) ?? []
  const volumeSparkline = btcChart?.total_volumes?.map(([, vol]) => vol) ?? []

  const mcapColor = marketChange >= 0 ? colors.positive : colors.negative
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

      <StatsWidget
        activeCoins={activeCoins}
        markets={markets}
        isLoading={isLoading}
      />
    </div>
  )
}
