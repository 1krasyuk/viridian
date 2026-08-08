import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Gauge, TrendingDown, TrendingUp } from 'lucide-react'

import type { CoinsList } from '@/features/market/types/coins-list'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'

import { MarketSectionHeader } from './market-section-header'

function PerformanceList({ coins, positive }: { coins: CoinsList[]; positive: boolean }) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        {positive ? <TrendingUp className='size-4 text-emerald-500' /> : <TrendingDown className='size-4 text-destructive' />}
        {positive ? 'Top gainers' : 'Top losers'}
      </div>
      {coins.map((coin) => (
        <Link
          key={coin.id}
          to='/coins/$coinId'
          params={{ coinId: coin.id }}
          className='group flex items-center gap-2 rounded-xl border border-border/60 bg-muted/45 p-2.5 transition-colors hover:border-emerald-500/40 focus-visible:border-emerald-500/40 focus-visible:outline-none'
        >
          <img src={coin.image} alt='' className='size-8 rounded-full' loading='lazy' />
          <div className='min-w-0 flex-1'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <p className='truncate text-sm font-semibold transition-colors group-hover:text-emerald-500 group-focus-visible:text-emerald-500'>
                {coin.name}
              </p>
              <Badge variant='secondary' className='h-4 px-1.5 text-[9px] uppercase'>
                {coin.symbol}
              </Badge>
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              #{coin.market_cap_rank ?? '—'}
            </p>
          </div>
          <span className={cn('text-sm font-bold tabular-nums', positive ? 'text-emerald-500' : 'text-destructive')}>
            {(coin.price_change_percentage_24h ?? 0) > 0 ? '+' : ''}
            {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
          </span>
        </Link>
      ))}
    </div>
  )
}

export function MarketPerformanceLeaders({
  coins,
  isLoading,
}: {
  coins: CoinsList[]
  isLoading: boolean
}) {
  const { gainers, losers } = useMemo(() => {
    const ranked = coins
      .filter((coin) => Number.isFinite(coin.price_change_percentage_24h))
      .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    return { gainers: ranked.slice(0, 4), losers: ranked.slice(-4).reverse() }
  }, [coins])

  return (
    <section className='flex min-h-0 flex-col rounded-xl border border-border/30 bg-linear-to-br from-card to-background p-4'>
      <MarketSectionHeader
        icon={Gauge}
        title='Performance leaders'
        description='The strongest and weakest 24-hour moves among market leaders.'
        tooltip={
          <>
            Shows the <span className='font-semibold text-emerald-400'>four strongest gains</span>{' '}
            and <span className='font-semibold text-destructive'>four steepest losses</span>{' '}
            over 24 hours within the top 250.
          </>
        }
        badge='24H'
      />
      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className='h-14 rounded-xl' />)}
        </div>
      ) : (
        <div className='grid flex-1 gap-4 sm:grid-cols-2'>
          <PerformanceList coins={gainers} positive />
          <PerformanceList coins={losers} positive={false} />
        </div>
      )}
    </section>
  )
}
