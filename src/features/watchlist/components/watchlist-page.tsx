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
  Trash2,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronDown,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { CoinsList } from '@/features/market/types/coins-list'
import { WatchlistTable } from './watchlist-table'

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

// ─── Coin Row ───────────────────────────────────────────────────

function CoinRow({ coin, change }: { coin: CoinsList; change: number }) {
  const { format } = useCurrency()
  const positive = change >= 0

  return (
    <div className='flex items-center gap-3'>
      <img
        src={coin.image}
        alt={coin.name}
        className='h-10 w-10 rounded-full shrink-0'
      />
      <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <span className='font-semibold text-sm truncate'>{coin.name}</span>
          <span className='text-[10px] font-mono bg-muted px-1 py-0.5 rounded'>
            {coin.symbol.toUpperCase()}
          </span>
        </div>
        <span className='text-sm font-mono text-muted-foreground'>
          {format(coin.current_price)}
        </span>
      </div>
      <div className='flex flex-col items-end gap-0.5'>
        <div className='flex items-center gap-1'>
          <span
            className={cn(
              'text-sm font-mono font-medium',
              positive
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-destructive',
            )}
          >
            {positive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Cap + Volume Card ──────────────────────────────────────────

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
    <div className='rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-4 flex flex-col gap-3'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground capitalize tracking-wider font-medium'>
        <BarChart3 className='h-4 w-4' />
        Watchlist Overview
      </div>
      <div className='grid grid-cols-2'>
        <div>
          <div className='text-xs text-muted-foreground mb-1'>Total Cap</div>
          <div className='text-2xl font-bold font-mono'>
            {format(totalMcap, { notation: 'compact' })}
          </div>
          <div className='flex items-center gap-1.5 mt-1'>
            {positive ? (
              <TrendingUp className='h-3 w-3 text-emerald-500' />
            ) : (
              <TrendingDown className='h-3 w-3 text-destructive' />
            )}
            <span
              className={cn(
                'text-xs font-mono',
                positive
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-destructive',
              )}
            >
              {positive ? '+' : ''}
              {format(totalMcapChange, { notation: 'compact' })} (
              {totalMcapChangePercent >= 0 ? '+' : ''}
              {totalMcapChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div>
          <div className='text-xs text-muted-foreground mb-1'>24h Volume</div>
          <div className='text-2xl font-bold font-mono'>
            {format(totalVolume, { notation: 'compact' })}
          </div>
          <div className='flex items-center gap-1.5 mt-1'>
            <img src={topVolume.image} className='h-4 w-4 rounded-full' />
            <span className='text-xs text-muted-foreground'>
              {topVolume.symbol.toUpperCase()} leads volume
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dominance Card ─────────────────────────────────────────────

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

  const size = 80
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const segments = useMemo(
    () =>
      computeSegments(data, circumference, radius, strokeWidth, size, colors),
    [data, circumference, radius, strokeWidth, size, colors],
  )

  return (
    <div className='rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-4 flex flex-col gap-3'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground capitalize tracking-wider font-medium'>
        <PieChart className='h-4 w-4' />
        Dominance
      </div>
      <div className='flex items-center gap-4'>
        <svg width={size} height={size} className='shrink-0 -rotate-90'>
          {segments}
        </svg>
        <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
          {data.slice(0, 3).map((coin, i) => (
            <div key={coin.id} className='flex items-center gap-1.5'>
              <div
                className='h-2.5 w-2.5 rounded-full shrink-0'
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className='text-xs truncate'>
                {coin.symbol.toUpperCase()}
              </span>
              <span className='text-xs text-muted-foreground ml-auto'>
                {coin.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Movers Card ─────────────────────────────────────────────────

function MoversCard({ coins }: { coins: CoinsList[] }) {
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
    <div className='rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-4 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground capitalize tracking-wider font-medium'>
          <BarChart3 className='h-4 w-4' />
          Movers
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs gap-1 px-2.5 rounded-lg bg-muted/30 border-muted-foreground/10 hover:bg-muted/50'
            >
              {label}
              <ChevronDown className='h-3 w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-20 rounded-xl'>
            {Object.entries(PERIOD_LABELS).map(([value, lbl]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setPeriod(value)}
                className={cn(
                  'text-xs px-2 py-1.5 rounded-lg cursor-pointer',
                  period === value ? 'bg-accent' : '',
                )}
              >
                {lbl}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CoinRow coin={best} change={bestChange} />

      <div className='h-px bg-border/30' />

      <CoinRow coin={worst} change={worstChange} />
    </div>
  )
}

// ─── Watchlist Summary ──────────────────────────────────────────

function WatchlistSummary({ coins }: { coins: CoinsList[] }) {
  if (coins.length === 0) return null

  return (
    <div className='grid sm:grid-cols-3 gap-4 mb-4'>
      <CapVolumeCard coins={coins} />
      <DominanceCard coins={coins} />
      {coins.length >= 2 && <MoversCard coins={coins} />}
    </div>
  )
}

// ─── Watchlist Header ───────────────────────────────────────────

function WatchlistHeader({
  count,
  onClear,
}: {
  count: number
  onClear: () => void
}) {
  return (
    <div className='flex items-center justify-between mb-4 px-4 pt-4'>
      <div className='flex items-center gap-2'>
        <Star className='h-5 w-5 fill-amber-400 text-amber-400' />
        <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
          Watchlist
        </h1>
        <span className='text-xs sm:text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md'>
          {count}
        </span>
      </div>

      {count > 0 && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClear}
          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2'
        >
          <Trash2 className='h-4 w-4 mr-1' />
          <span className='hidden sm:inline text-xs'>Clear all</span>
        </Button>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export function WatchlistPage() {
  useWatchlistSync()

  const coins = useWatchlistStore((state) => state.coins)
  const clearWatchlist = useWatchlistStore((state) => state.clearWatchlist)

  return (
    <div className='space-y-0'>
      <WatchlistHeader count={coins.length} onClear={clearWatchlist} />
      <div className='px-4'>
        <WatchlistSummary coins={coins} />
      </div>
      <WatchlistTable />
    </div>
  )
}
