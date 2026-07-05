import { useWatchlistStore } from '../store/watchlist-store'
import { useCurrency } from '@/features/currency/hooks'
import { useWatchlistSync } from '../hooks/use-watchlist-sync'
import { Button } from '@/shared/ui/button'
import { Trash2, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { CoinsList } from '@/features/market/types/coins-list'
import { WatchlistTable } from './watchlist-table'

// Summary Card

function SummaryCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
  icon?: React.ComponentType<{ className?: string }>
}) {
  const colorClass =
    positive === true
      ? 'text-emerald-500 dark:text-emerald-400'
      : positive === false
        ? 'text-destructive'
        : 'text-foreground'

  return (
    <div className='rounded-xl border border-border/20 bg-linear-to-br from-card to-background p-3 flex flex-col gap-1'>
      <span className='text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium'>
        {label}
      </span>
      <div className='flex items-baseline gap-1.5'>
        {Icon && <Icon className={cn('h-3.5 w-3.5', colorClass)} />}
        <span
          className={cn('text-sm sm:text-base font-bold font-mono', colorClass)}
        >
          {value}
        </span>
      </div>
      {sub && (
        <span className='text-[10px] sm:text-xs text-muted-foreground font-mono'>
          {sub}
        </span>
      )}
    </div>
  )
}

// Watchlist Summary

function WatchlistSummary({ coins }: { coins: CoinsList[] }) {
  const { format } = useCurrency()

  if (coins.length === 0) return null

  const avgChange24h =
    coins.reduce((acc, c) => acc + (c.price_change_percentage_24h ?? 0), 0) /
    coins.length

  const totalMcap = coins.reduce((acc, c) => acc + (c.market_cap ?? 0), 0)

  const best = coins.reduce((a, b) =>
    (a.price_change_percentage_24h ?? -Infinity) >
    (b.price_change_percentage_24h ?? -Infinity)
      ? a
      : b,
  )

  const worst = coins.reduce((a, b) =>
    (a.price_change_percentage_24h ?? Infinity) <
    (b.price_change_percentage_24h ?? Infinity)
      ? a
      : b,
  )

  const avgIcon =
    avgChange24h > 0 ? TrendingUp : avgChange24h < 0 ? TrendingDown : Minus

  return (
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3'>
      <SummaryCard
        label='Avg 24h'
        value={`${avgChange24h >= 0 ? '+' : ''}${avgChange24h.toFixed(2)}%`}
        positive={avgChange24h >= 0}
        icon={avgIcon}
      />
      <SummaryCard
        label='Total Cap'
        value={format(totalMcap, {
          notation: 'compact',
          maximumFractionDigits: 2,
        })}
      />
      <SummaryCard
        label='Best'
        value={best.symbol.toUpperCase()}
        sub={`+${(best.price_change_percentage_24h ?? 0).toFixed(2)}%`}
        positive={true}
        icon={TrendingUp}
      />
      <SummaryCard
        label='Worst'
        value={worst.symbol.toUpperCase()}
        sub={`${(worst.price_change_percentage_24h ?? 0).toFixed(2)}%`}
        positive={false}
        icon={TrendingDown}
      />
    </div>
  )
}

// Watchlist Header

function WatchlistHeader({
  count,
  onClear,
}: {
  count: number
  onClear: () => void
}) {
  return (
    <div className='flex items-center justify-between mb-3'>
      <div className='flex items-center gap-2'>
        <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
        <h1 className='text-lg sm:text-xl font-bold tracking-tight'>
          Watchlist
        </h1>
        <span className='text-xs sm:text-sm text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md'>
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
          <Trash2 className='h-3.5 w-3.5 mr-1' />
          <span className='hidden sm:inline text-xs'>Clear all</span>
        </Button>
      )}
    </div>
  )
}

// Main Component

export function WatchlistPage() {
  useWatchlistSync()

  const coins = useWatchlistStore((state) => state.coins)
  const clearWatchlist = useWatchlistStore((state) => state.clearWatchlist)

  return (
    <div className='space-y-0'>
      <WatchlistHeader count={coins.length} onClear={clearWatchlist} />
      <WatchlistSummary coins={coins} />
      <WatchlistTable />
    </div>
  )
}
