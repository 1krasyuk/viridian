import { Link } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Badge } from '@/shared/ui/badge'
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

function TrendingCard({
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
      className='group w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-linear-to-br from-card to-background p-3 text-xs transition-colors hover:border-primary/45'
    >
      <div className='flex min-w-0 items-center gap-3'>
        <img
          src={coin.image}
          alt=''
          loading='lazy'
          className='size-8 shrink-0 rounded-full'
        />
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-1'>
            <p className='truncate text-base font-bold'>{coin.name}</p>
            <Badge variant='secondary' className='text-xs uppercase'>
              {coin.symbol}
            </Badge>
          </div>
          {coin.market_cap_rank != null && (
            <span className='mt-0.5 block text-xs text-muted-foreground tabular-nums'>
              #{coin.market_cap_rank}
            </span>
          )}
        </div>
        <div className='min-w-0 max-w-[42%] shrink text-right'>
          <p className='truncate text-sm font-bold tabular-nums'>
            {format(coin.current_price, { maximumFractionDigits: 6 })}
          </p>
          <div className='mt-0.5'>
            <PriceChange value={coin.price_change_percentage_24h} />
          </div>
        </div>
      </div>

      <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Market cap</p>
          <p className='truncate font-medium tabular-nums'>
            {format(coin.market_cap, { notation: 'compact' })}
          </p>
        </div>
        <div className='min-w-0 text-right'>
          <p className='text-muted-foreground'>Volume 24H</p>
          <p className='truncate font-medium tabular-nums'>
            {format(coin.total_volume, { notation: 'compact' })}
          </p>
        </div>
      </div>
    </Link>
  )
}

function TrendingSkeletons() {
  return (
    <div className='grid gap-2'>
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className='h-27 rounded-xl' />
      ))}
    </div>
  )
}

export function SearchTrendings({
  coins,
  isLoading,
  onNavigate,
}: {
  coins: CoinsList[]
  isLoading: boolean
  onNavigate: () => void
}) {
  return (
    <section className='flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-hidden lg:h-full lg:border-l lg:border-border/70 lg:pl-4'>
      <div className='mb-2 flex min-h-8 shrink-0 items-center gap-2'>
        <span className='flex size-5 shrink-0 items-center justify-center'>
          <TrendingUp className='size-4 text-foreground' />
        </span>
        <h2 className='text-lg font-semibold'>Trending coins</h2>
      </div>
      <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
        {isLoading ? (
          <TrendingSkeletons />
        ) : (
          <div className='grid gap-2'>
            {coins.map((coin) => (
              <TrendingCard
                key={coin.id}
                coin={coin}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
