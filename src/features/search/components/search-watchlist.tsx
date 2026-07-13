import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

function PriceChange({ value }: { value: number | null }) {
  if (value == null) return <span className='text-muted-foreground'>—</span>
  return (
    <span
      className={cn(
        'text-xs font-semibold tabular-nums',
        value >= 0 ? 'text-emerald-500' : 'text-destructive',
      )}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

function CoinSparkline({ coin }: { coin: CoinsList }) {
  const prices = coin.sparkline_in_7d?.price?.filter(Number.isFinite) ?? []
  if (prices.length < 2) return <div className='h-9 w-24' />

  const min = Math.min(...prices)
  const range = Math.max(...prices) - min || 1
  const points = prices
    .map(
      (price, index) =>
        `${(index / (prices.length - 1)) * 100},${36 - ((price - min) / range) * 32}`,
    )
    .join(' ')
  const path = `M ${points.replaceAll(' ', ' L ')}`
  const positive = prices.at(-1)! >= prices[0]

  return (
    <svg
      viewBox='0 0 100 40'
      preserveAspectRatio='none'
      className={cn(
        'h-9 w-24 shrink-0',
        positive ? 'text-emerald-500' : 'text-destructive',
      )}
      aria-hidden='true'
    >
      <path
        d={path}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function WatchlistCard({
  coin,
  onNavigate,
}: {
  coin: CoinsList
  onNavigate: () => void
}) {
  const { format } = useCurrency()
  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      onClick={onNavigate}
      className='flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border bg-linear-to-br from-card to-background p-3 transition-colors hover:border-primary/45'
    >
      <div className='flex w-full min-w-0 items-center gap-2'>
        <img src={coin.image} alt='' className='size-8 shrink-0 rounded-full' />
        <div className='flex min-w-0 items-center gap-1'>
          <p className='min-w-0 truncate text-base font-semibold'>{coin.name}</p>
          <Badge variant='secondary' className='h-4 px-1.5 text-[9px] uppercase'>
            {coin.symbol}
          </Badge>
        </div>
      </div>
      <div className='mt-2 flex w-full items-center gap-2'>
        <p className='text-sm font-bold tabular-nums'>
          {format(coin.current_price, { maximumFractionDigits: 6 })}
        </p>
        <PriceChange value={coin.price_change_percentage_24h} />
      </div>
      <div className='mt-1 w-full overflow-hidden'>
        <CoinSparkline coin={coin} />
      </div>
    </Link>
  )
}

function WatchlistSkeleton({ count }: { count: number }) {
  return (
    <div className='grid gap-2 sm:grid-cols-2'>
      {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
        <Skeleton key={index} className='h-20 rounded-xl' />
      ))}
    </div>
  )
}

export function SearchWatchlist({
  watchlist,
  coins,
  isLoading,
  onNavigate,
}: {
  watchlist: CoinsList[]
  coins: CoinsList[]
  isLoading: boolean
  onNavigate: () => void
}) {
  return (
    <section className='flex min-h-0 w-full flex-1 flex-col'>
      <div className='mb-2 flex min-h-8 items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <span className='flex size-5 shrink-0 items-center justify-center'>
            <Star className='size-4 text-foreground' />
          </span>
          <h2 className='text-lg font-semibold'>Watchlist</h2>
        </div>
        {watchlist.length > 0 && (
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='rounded-md text-xs text-muted-foreground hover:bg-transparent! hover:text-foreground'
          >
            <Link to='/watchlist' onClick={onNavigate}>
              Manage watchlist
            </Link>
          </Button>
        )}
      </div>

      {watchlist.length > 0 ? (
        isLoading ? (
          <WatchlistSkeleton count={watchlist.length} />
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
            {coins.map((coin) => (
              <WatchlistCard
                key={coin.id}
                coin={coin}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )
      ) : (
        <div className='flex min-h-52 flex-1 flex-col items-center justify-center rounded-xl border border-border/60 bg-background/60 px-4 text-center'>
          <Star className='mb-3 size-6 text-foreground' />
          <h3 className='text-base font-semibold'>
            Start building your watchlist
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            You haven't followed any tokens yet.
          </p>
          <Button asChild size='sm' className='mt-3 rounded-md'>
            <Link to='/watchlist' onClick={onNavigate}>
              Get started
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
