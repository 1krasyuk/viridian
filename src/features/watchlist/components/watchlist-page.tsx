/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react'
import { useWatchlistStore } from '../store/watchlist-store'
import { useCurrency } from '@/features/currency/hooks'
import { useWatchlistSync } from '../hooks/use-watchlist-sync'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  BarChart3,
  PieChart,
  Zap,
  Activity,
  Minus,
  Search,
  Star,
  Plus,
  Lock,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { CoinsList } from '@/features/market/types/coins-list'
import { WatchlistTable } from './watchlist-table'
import { Badge } from '@/shared/ui/badge'
import { Link } from '@tanstack/react-router'

const PERIOD_LABELS: Record<string, string> = {
  '1': '24H',
  '7': '7D',
  '30': '1M',
}

const PERIOD_FIELD: Record<string, keyof CoinsList> = {
  '1': 'price_change_percentage_24h',
  '7': 'price_change_percentage_7d_in_currency',
  '30': 'price_change_percentage_30d_in_currency',
}

//  Cap + Volume Card

function CapVolumeCard({ coins }: { coins: CoinsList[] }) {
  const { format } = useCurrency()

  const totalMcap = coins.reduce((acc, c) => acc + (c.market_cap ?? 0), 0)
  const totalMcapChange = coins.reduce(
    (acc, c) => acc + (c.market_cap_change_24h ?? 0),
    0,
  )
  const totalMcapChangePercent =
    totalMcap > 0 ? (totalMcapChange / (totalMcap - totalMcapChange)) * 100 : 0

  const totalVolume = coins.reduce((acc, c) => acc + (c.total_volume ?? 0), 0)
  const topVolume = coins.reduce((a, b) =>
    (a.total_volume ?? 0) > (b.total_volume ?? 0) ? a : b,
  )

  const positive = totalMcapChange >= 0

  return (
    <div className='rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-3 xl:p-4 flex flex-col gap-2'>
      <div className='flex items-center gap-2 text-xs xl:text-sm text-muted-foreground capitalize tracking-wider font-medium'>
        <BarChart3 className='h-3.5 w-3.5 xl:h-4 xl:w-4' />
        Overview
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <div className='text-[11px] xl:text-xs text-muted-foreground mb-0.5 xl:mb-1'>
            Total Cap
          </div>
          <div className='text-base xl:text-2xl font-bold font-mono'>
            {format(totalMcap, { notation: 'compact' })}
          </div>
          <div className='flex items-center gap-1.5 mt-0.5 xl:mt-1'>
            {positive ? (
              <TrendingUp className='h-3.5 w-3.5 xl:h-4 xl:w-4 text-emerald-500' />
            ) : (
              <TrendingDown className='h-3.5 w-3.5 xl:h-4 xl:w-4 text-destructive' />
            )}
            <span
              className={cn(
                'text-[11px] xl:text-xs font-mono',
                positive
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-destructive',
              )}
            >
              {format(Math.abs(totalMcapChange), { notation: 'compact' })} (
              {totalMcapChangePercent >= 0 ? '+' : ''}
              {totalMcapChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div>
          <div className='text-[11px] xl:text-xs text-muted-foreground mb-0.5 xl:mb-1'>
            24h Volume
          </div>
          <div className='text-base xl:text-2xl font-bold font-mono'>
            {format(totalVolume, { notation: 'compact' })}
          </div>
          <div className='flex items-center gap-1.5 mt-0.5 xl:mt-1'>
            <img
              src={topVolume.image}
              className='h-3.5 w-3.5 xl:h-4 xl:w-4 rounded-full'
            />
            <span className='text-xs text-muted-foreground'>
              {topVolume.symbol.toUpperCase()} leads volume
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

//  Dominance Card

function computeSegments(
  data: Array<{ id: string; percent: number }>,
  circumference: number,
  radius: number,
  strokeWidth: number,
  size: number,
  colors: string[],
): React.ReactNode[] {
  let offset = 0
  return data.map((coin, i) => {
    const dash = (coin.percent / 100) * circumference
    const segment = (
      <circle
        key={coin.id}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke={colors[i % colors.length]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        strokeLinecap='butt'
      />
    )
    offset += dash
    return segment
  })
}

function DominanceCard({ coins }: { coins: CoinsList[] }) {
  const totalMcap = coins.reduce((acc, c) => acc + (c.market_cap ?? 0), 0)

  const data = useMemo(() => {
    return coins
      .map((coin) => ({
        ...coin,
        percent: totalMcap > 0 ? ((coin.market_cap ?? 0) / totalMcap) * 100 : 0,
      }))
      .sort((a, b) => b.percent - a.percent)
  }, [coins, totalMcap])

  const colors = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]

  const size = 64
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const segments = useMemo(
    () =>
      computeSegments(data, circumference, radius, strokeWidth, size, colors),
    [data, circumference, radius, strokeWidth, size, colors],
  )

  return (
    <div className='h-full rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-3 xl:p-4 flex flex-col gap-2 '>
      <div className='flex items-center gap-2 text-xs xl:text-sm text-muted-foreground capitalize tracking-wider font-medium'>
        <PieChart className='h-3.5 w-3.5 xl:h-4 xl:w-4' />
        Dominance
      </div>
      <div className='flex items-center gap-2 xl:gap-4'>
        <svg width={size} height={size} className='shrink-0 -rotate-90'>
          {segments}
        </svg>
        <div className='flex flex-col gap-1 xl:gap-1.5 min-w-0 flex-1'>
          {data.slice(0, 3).map((coin, i) => (
            <div key={coin.id} className='flex items-center gap-1.5'>
              <div
                className='h-2 w-2 xl:h-2.5 xl:w-2.5 rounded-full shrink-0'
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className='text-[11px] xl:text-xs truncate'>
                {coin.symbol.toUpperCase()}
              </span>
              <span className='text-[11px] xl:text-xs text-muted-foreground ml-auto'>
                {coin.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

//  Sentiment Card

function SentimentCard({ coins }: { coins: CoinsList[] }) {
  const bullish = coins.filter(
    (c) => (c.price_change_percentage_7d_in_currency ?? 0) > 0,
  ).length
  const bearish = coins.filter(
    (c) => (c.price_change_percentage_7d_in_currency ?? 0) < 0,
  ).length
  const neutral = coins.filter(
    (c) => (c.price_change_percentage_7d_in_currency ?? 0) === 0,
  ).length

  const total = coins.length
  const bullishPercent = total > 0 ? (bullish / total) * 100 : 0
  const bearishPercent = total > 0 ? (bearish / total) * 100 : 0
  const neutralPercent = total > 0 ? (neutral / total) * 100 : 0

  return (
    <div className='h-full rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-3 xl:p-4 flex flex-col gap-2 '>
      <div className='flex items-center gap-2 text-xs xl:text-sm text-muted-foreground capitalize tracking-wider font-medium'>
        <Activity className='h-3.5 w-3.5 xl:h-4 xl:w-4' />
        Sentiment
      </div>

      {/* Counts */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col items-center gap-0.5'>
          <span className='text-[11px] xl:text-xs text-muted-foreground'>
            Rising
          </span>
          <div className='flex items-center gap-1'>
            <TrendingUp className='h-4 w-4 xl:h-5 xl:w-5 text-emerald-500' />
            <span className='text-xl xl:text-xl font-bold font-mono text-emerald-500 dark:text-emerald-400'>
              {bullish}
            </span>
          </div>
        </div>

        {neutral > 0 && (
          <div className='flex flex-col items-center gap-0.5'>
            <div className='flex items-center gap-1'>
              <Minus className='h-4 w-4 xl:h-5 xl:w-5 text-muted-foreground' />
              <span className='text-xl xl:text-xl font-bold font-mono text-muted-foreground'>
                {neutral}
              </span>
            </div>
            <span className='text-[11px] xl:text-xs text-muted-foreground'>
              Flat
            </span>
          </div>
        )}

        <div className='flex flex-col items-center gap-0.5'>
          <span className='text-[11px] xl:text-xs text-muted-foreground'>
            Falling
          </span>
          <div className='flex items-center gap-1'>
            <TrendingDown className='h-4 w-4 xl:h-5 xl:w-5 text-destructive' />
            <span className='text-xl xl:text-xl font-bold font-mono text-destructive'>
              {bearish}
            </span>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className='flex h-1.5 xl:h-2 w-full rounded-full overflow-hidden'>
        <div
          className='bg-emerald-500'
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className='bg-muted-foreground/30'
          style={{ width: `${neutralPercent}%` }}
        />
        <div
          className='bg-destructive'
          style={{ width: `${bearishPercent}%` }}
        />
      </div>
    </div>
  )
}

//  Movers Card

function MoversCard({ coins }: { coins: CoinsList[] }) {
  const { format } = useCurrency()
  const [period, setPeriod] = useState('1')

  const field = PERIOD_FIELD[period]
  const label = PERIOD_LABELS[period]

  const best = coins.reduce((a, b) => {
    const aVal = (a[field] as number | null) ?? -Infinity
    const bVal = (b[field] as number | null) ?? -Infinity
    return aVal > bVal ? a : b
  })

  const worst = coins.reduce((a, b) => {
    const aVal = (a[field] as number | null) ?? Infinity
    const bVal = (b[field] as number | null) ?? Infinity
    return aVal < bVal ? a : b
  })

  const bestChange = (best[field] as number | null) ?? 0
  const worstChange = (worst[field] as number | null) ?? 0

  return (
    <div className='h-full rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-3 py-2.5 xl:p-4 xl:py-3 flex flex-col gap-2 '>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-xs xl:text-sm text-muted-foreground capitalize tracking-wider font-medium'>
          <Zap className='h-3.5 w-3.5 xl:h-4 xl:w-4' />
          Movers
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-5 xl:h-6 text-[11px] xl:text-xs gap-1 px-1.5 xl:px-2.5 rounded-md bg-muted border-muted-foreground/10 hover:bg-muted/70'
            >
              {label}
              <ChevronDown className='h-2.5 w-2.5 xl:h-3 xl:w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-10 rounded-xl'>
            {Object.entries(PERIOD_LABELS).map(([value, lbl]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setPeriod(value)}
                className={cn(
                  'text-[11px] xl:text-xs px-2 py-1 rounded-md cursor-pointer',
                  period === value ? 'bg-accent' : '',
                )}
              >
                {lbl}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex flex-col xl:grid xl:grid-cols-2 gap-3 xl:gap-4'>
        {/* Best */}
        <div className='flex flex-col gap-1 xl:gap-1.5'>
          <span className='text-[11px] xl:text-xs capitalize tracking-wider text-muted-foreground font-medium'>
            Best
          </span>
          <div className='flex items-center gap-2'>
            <img
              src={best.image}
              className='h-6 w-6 xl:h-8 xl:w-8 rounded-full shrink-0'
            />
            <div className='min-w-0'>
              <div className='flex items-center gap-1'>
                <div className='font-semibold text-sm xl:text-sm truncate'>
                  {best.name}
                </div>
                <Badge
                  variant='secondary'
                  className='text-[10px] xl:text-xs px-1.5 xl:px-2 '
                >
                  {best.symbol.toUpperCase()}
                </Badge>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='text-[11px] xl:text-xs font-mono text-muted-foreground'>
                  {format(best.current_price)}
                </span>
                <span className='text-[11px] xl:text-xs font-mono font-medium text-emerald-500 dark:text-emerald-400'>
                  +{bestChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Worst */}
        <div className='flex flex-col gap-1 xl:gap-1.5'>
          <span className='text-[11px] xl:text-xs capitalize tracking-wider text-muted-foreground font-medium'>
            Worst
          </span>
          <div className='flex items-center gap-2'>
            <img
              src={worst.image}
              className='h-6 w-6 xl:h-8 xl:w-8 rounded-full shrink-0'
            />
            <div className='min-w-0'>
              <div className='flex items-center gap-1'>
                <div className='font-semibold text-sm xl:text-sm truncate'>
                  {worst.name}
                </div>
                <Badge
                  variant='secondary'
                  className='text-[10px] xl:text-xs  px-1.5 xl:px-2 '
                >
                  {worst.symbol.toUpperCase()}
                </Badge>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='text-[11px] xl:text-xs font-mono text-muted-foreground'>
                  {format(worst.current_price)}
                </span>
                <span className='text-[11px] xl:text-xs font-mono font-medium text-destructive'>
                  {worstChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Phantom Card (placeholder for single coin state)

function PhantomCard({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className='h-23 xl:h-full rounded-xl border border-border bg-linear-to-br from-card/50 to-background/50 p-3 xl:p-4 flex flex-col gap-2 '>
      <div className='flex items-center gap-2 text-xs xl:text-sm text-muted-foreground/80 capitalize tracking-wider font-medium'>
        <Icon className='h-3.5 w-3.5 xl:h-4 xl:w-4' />
        {label}
      </div>
      <div className='flex-1 flex items-center justify-center xl:min-h-25'>
        <div className='flex flex-col items-center gap-1.5 text-muted-foreground/40'>
          <Plus className='h-5 w-5' />
          <span className='text-[10px] xl:text-xs'>Add more coins</span>
        </div>
      </div>
    </div>
  )
}

// Single Coin Overlay

function SingleCoinOverlay() {
  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center'>
      <div className='rounded-2xl border border-border/30 bg-muted/20 px-6 py-15 md:py-10 backdrop-blur-xs flex flex-col items-center gap-3 shadow-lg w-full text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
          <Lock className='h-5 w-5 text-muted-foreground' />
        </div>
        <div>
          <p className='text-base xl:text-lg font-semibold'>Add more coins</p>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Track multiple assets to see full watchlist stats
          </p>
        </div>
      </div>
    </div>
  )
}

//  Watchlist Summary

function WatchlistSummary({ coins }: { coins: CoinsList[] }) {
  if (coins.length === 0) return null

  const isSingle = coins.length === 1

  return (
    <div className='relative'>
      <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 mb-3 xl:mb-4 '>
        {isSingle ? (
          <>
            <div className='order-1 mx-3 py-1 md:py-3'>
              <PhantomCard icon={BarChart3} label='Overview' />
            </div>
            <div className='order-2 xl:order-4 mx-3 py-1 md:py-3'>
              <PhantomCard icon={Zap} label='Movers' />
            </div>
            <div className='order-3 xl:order-2 mx-3 py-1 md:py-3'>
              <PhantomCard icon={PieChart} label='Dominance' />
            </div>
            <div className='order-4 xl:order-3 mx-3 py-1 md:py-3'>
              <PhantomCard icon={Activity} label='Sentiment' />
            </div>
          </>
        ) : (
          <>
            <div className='order-1'>
              <CapVolumeCard coins={coins} />
            </div>
            <div className='order-2 xl:order-4'>
              <MoversCard coins={coins} />
            </div>
            <div className='order-3 xl:order-2'>
              <DominanceCard coins={coins} />
            </div>
            <div className='order-4 xl:order-3'>
              <SentimentCard coins={coins} />
            </div>
          </>
        )}
      </div>

      {isSingle && <SingleCoinOverlay />}
    </div>
  )
}

function WatchlistHeader() {
  return (
    <div className='flex flex-col md:hidden items-center mb-3 xl:mb-4 px-3 xl:px-4 pt-3 xl:pt-4'>
      <div className='relative mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15'>
        <Star className='h-7 w-7 fill-amber-400 text-amber-400' />
      </div>
      <h1 className='text-xl xl:text-2xl font-bold tracking-wide'>Watchlist</h1>
    </div>
  )
}

// Main Component

export function WatchlistPage() {
  useWatchlistSync()

  const coins = useWatchlistStore((state) => state.coins)

  return (
    <div className='space-y-0'>
      <WatchlistHeader />
      <div className='px-3 '>
        <WatchlistSummary coins={coins} />
      </div>
      <WatchlistTable />
      <div className='flex justify-center mt-6 mb-6'>
        <Button variant='outline' asChild className='h-10 px-6'>
          <Link to='/' className='flex items-center gap-2'>
            <Search className='h-4 w-4' />
            Explore Market
          </Link>
        </Button>
      </div>
    </div>
  )
}
