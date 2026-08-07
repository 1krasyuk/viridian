import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Waves } from 'lucide-react'

import type { CoinsList } from '@/features/market/types/coins-list'
import { Skeleton } from '@/shared/ui/skeleton'

import { MarketSectionHeader } from './market-section-header'

export function MarketLiquidityOverview({ coins, isLoading }: { coins: CoinsList[]; isLoading: boolean }) {
  const stats = useMemo(() => {
    const valid = coins
      .filter((coin) => (coin.market_cap ?? 0) > 0 && (coin.total_volume ?? 0) > 0)
      .map((coin) => ({
        ...coin,
        turnover: ((coin.total_volume ?? 0) / (coin.market_cap ?? 1)) * 100,
      }))
    const totalCap = valid.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0)
    const totalVolume = valid.reduce((sum, coin) => sum + (coin.total_volume ?? 0), 0)
    const leaders = valid.sort((a, b) => b.turnover - a.turnover).slice(0, 5)
    return {
      marketTurnover: totalCap ? (totalVolume / totalCap) * 100 : 0,
      leaders,
      maxTurnover: leaders[0]?.turnover ?? 1,
    }
  }, [coins])

  return (
    <section className='flex min-h-0 flex-col rounded-xl border border-border/30 bg-linear-to-br from-card to-background p-4'>
      <MarketSectionHeader
        icon={Waves}
        title='Liquidity overview'
        description='Trading activity relative to each asset’s market capitalization.'
        tooltip={
          <>
            Uses the <span className='font-semibold text-foreground'>24H volume / market cap</span>{' '}
            ratio as a turnover indicator.{' '}
            <span className='font-semibold text-amber-400'>Higher activity does not always mean lower risk.</span>
          </>
        }
        badge='24H'
      />
      {isLoading ? (
        <div className='space-y-3'>
          <Skeleton className='h-16 rounded-lg' />
          {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className='h-9 rounded-lg' />)}
        </div>
      ) : (
        <div className='flex flex-1 flex-col'>
          <div className='mb-3 rounded-lg bg-muted/45 px-3 py-2'>
            <p className='text-xs text-muted-foreground'>Top-250 market turnover</p>
            <p className='mt-0.5 text-xl font-bold tabular-nums'>{stats.marketTurnover.toFixed(2)}%</p>
          </div>
          <div className='flex flex-1 flex-col justify-center gap-3'>
            {stats.leaders.map((coin, index) => (
              <div key={coin.id} className='flex items-center gap-3'>
                <span className='w-4 text-xs text-muted-foreground tabular-nums'>{index + 1}</span>
                <img src={coin.image} alt='' className='size-7 rounded-full' loading='lazy' />
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center justify-between gap-3'>
                    <Link
                      to='/coins/$coinId'
                      params={{ coinId: coin.id }}
                      className='truncate text-sm font-semibold transition-colors hover:text-emerald-500 focus-visible:text-emerald-500 focus-visible:outline-none'
                    >
                      {coin.name}
                    </Link>
                    <span className='text-xs font-medium tabular-nums'>{coin.turnover.toFixed(1)}%</span>
                  </div>
                  <div className='h-1.5 overflow-hidden rounded-full bg-muted/80'>
                    <div
                      className='h-full rounded-full bg-cyan-500/75'
                      style={{ width: `${Math.max((coin.turnover / stats.maxTurnover) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
