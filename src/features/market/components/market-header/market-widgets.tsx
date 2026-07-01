import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react'
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
      className='w-full'
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
  subvalue,
  sparkline,
  isLoading,
}: {
  title: string
  value: string
  change?: number
  subvalue?: string
  sparkline?: React.ReactNode
  isLoading: boolean
}) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className='flex-1 min-w-0 rounded-xl p-4 sm:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground capitalize font-semibold mb-1'>
          {title}
        </span>
        <ChevronRight className='h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors' />
      </div>

      {/* Value + change */}
      <div className='flex items-baseline gap-2 mb-1'>
        {isLoading ? (
          <Skeleton className='h-7 w-28' />
        ) : (
          <span className='text-xl sm:text-xl font-bold font-mono tracking-tight'>
            {value}
          </span>
        )}

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
      </div>

      {/* Subvalue */}
      {subvalue && !isLoading && (
        <p className='text-xs text-muted-foreground font-mono mb-1'>
          {subvalue}
        </p>
      )}
      {isLoading && <Skeleton className='h-3 w-20 mb-3' />}

      {/* Sparkline */}
      {sparkline}
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
    <div className='flex-1 min-w-0 rounded-xl p-4 sm:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm text-muted-foreground capitalize font-medium'>
          Dominance
        </span>
        <ChevronRight className='h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors' />
      </div>

      {isLoading ? (
        <Skeleton className='h-7 w-20 mb-1' />
      ) : (
        <div className='flex items-baseline gap-2 mb-1'>
          <span className='text-xl sm:text-xl font-bold font-mono tracking-tight'>
            {btcDominance.toFixed(1)}%
          </span>
          <span className='text-xs text-muted-foreground font-mono'>BTC</span>
        </div>
      )}

      {!isLoading && (
        <div className='mt-3'>
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
          <div className='flex justify-between mt-2 text-xs text-muted-foreground font-mono'>
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
    <div className='flex-1 min-w-0 rounded-xl p-4 sm:p-5 bg-linear-to-br from-card to-background hover:from-card hover:to-background/80 border border-border/20 transition-all duration-200 group cursor-pointer'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm text-muted-foreground capitalize font-medium'>
          Market Overview
        </span>
        <ChevronRight className='h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors' />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          {isLoading ? (
            <Skeleton className='h-7 w-16 mb-1' />
          ) : (
            <p className='text-xl sm:text-2xl font-bold font-mono tracking-tight'>
              {activeCoins.toLocaleString()}
            </p>
          )}
          <p className='text-xs text-muted-foreground capitalize'>Coins</p>
        </div>
        <div>
          {isLoading ? (
            <Skeleton className='h-7 w-16 mb-1' />
          ) : (
            <p className='text-xl sm:text-2xl font-bold font-mono tracking-tight'>
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

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 px-3'>
      <WidgetCard
        title='Market Cap'
        value={format(totalMcap, { notation: 'compact' })}
        change={marketChange}
        subvalue={
          totalMcap > 0
            ? `${((totalVolume / totalMcap) * 100).toFixed(1)}% vol/mcap`
            : undefined
        }
        sparkline={
          mcapSparkline.length > 1 ? (
            <Sparkline data={mcapSparkline} color={mcapColor} height={80} />
          ) : null
        }
        isLoading={isLoading}
      />

      <WidgetCard
        title='24h Volume'
        value={format(totalVolume, { notation: 'compact' })}
        subvalue={
          totalMcap > 0
            ? `${((totalVolume / totalMcap) * 100).toFixed(1)}% of cap`
            : undefined
        }
        sparkline={
          volumeSparkline.length > 1 ? (
            <Sparkline data={volumeSparkline} color={volColor} height={80} />
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
