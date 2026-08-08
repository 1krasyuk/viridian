import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { BarChart3 } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Skeleton } from '@/shared/ui/skeleton'

import { MarketSectionHeader } from './market-section-header'

function VolumeLeadersSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className='flex items-center gap-3'>
          <Skeleton className='size-8 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-2 w-full rounded-full' />
          </div>
          <Skeleton className='h-4 w-16' />
        </div>
      ))}
    </div>
  )
}

export function MarketVolumeLeaders({
  coins,
  isLoading,
}: {
  coins: CoinsList[]
  isLoading: boolean
}) {
  const { format } = useCurrency()
  const leaders = useMemo(
    () =>
      [...coins]
        .filter((coin) => (coin.total_volume ?? 0) > 0)
        .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
        .slice(0, 5),
    [coins],
  )
  const maxVolume = leaders[0]?.total_volume ?? 1
  const combinedVolume = leaders.reduce(
    (total, coin) => total + (coin.total_volume ?? 0),
    0,
  )

  return (
    <section className='flex min-h-0 flex-col rounded-xl border border-border/30 bg-linear-to-br from-card to-background p-4'>
      <MarketSectionHeader
        icon={BarChart3}
        title='Volume leaders'
        description='Most actively traded assets among the market leaders.'
        tooltip={
          <>
            Ranks the <span className='font-semibold text-foreground'>top 250</span>{' '}
            assets by reported trading volume over the{' '}
            <span className='font-semibold text-foreground'>last 24 hours</span>.
          </>
        }
        badge='24H'
      />

      {isLoading ? (
        <VolumeLeadersSkeleton />
      ) : (
        <div className='flex flex-1 flex-col'>
          <div className='mb-3 rounded-xl border border-border/70 bg-muted/55 p-2.5'>
            <p className='text-xs text-muted-foreground'>Combined top-5 volume</p>
            <p className='mt-0.5 text-xl font-bold tabular-nums'>
              {format(combinedVolume, { notation: 'compact' })}
            </p>
          </div>
          <div className='flex flex-1 flex-col justify-between gap-2.5'>
            {leaders.map((coin, index) => {
              const width = ((coin.total_volume ?? 0) / maxVolume) * 100
              return (
                <div key={coin.id} className='flex items-center gap-3'>
                  <span className='w-4 text-xs text-muted-foreground tabular-nums'>{index + 1}</span>
                  <img src={coin.image} alt='' loading='lazy' className='size-7 shrink-0 rounded-full' />
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center justify-between gap-3'>
                      <div className='min-w-0 truncate text-sm font-semibold'>
                        <Link
                          to='/coins/$coinId'
                          params={{ coinId: coin.id }}
                          className='transition-colors hover:text-emerald-500 focus-visible:text-emerald-500 focus-visible:outline-none'
                        >
                          {coin.name}
                        </Link>
                        <span className='ml-1.5 text-xs font-normal uppercase text-muted-foreground'>{coin.symbol}</span>
                      </div>
                      <span className='shrink-0 text-xs font-medium tabular-nums'>
                        {format(coin.total_volume, { notation: 'compact' })}
                      </span>
                    </div>
                    <div className='h-1.5 overflow-hidden rounded-full bg-muted/80'>
                      <div className='h-full rounded-full bg-primary/75' style={{ width: `${Math.max(width, 2)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
