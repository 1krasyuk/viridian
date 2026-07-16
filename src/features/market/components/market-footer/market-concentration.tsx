import { useMemo } from 'react'
import { ChartPie } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Skeleton } from '@/shared/ui/skeleton'

import { MarketSectionHeader } from './market-section-header'

export function MarketConcentration({
  coins,
  isLoading,
}: {
  coins: CoinsList[]
  isLoading: boolean
}) {
  const { format } = useCurrency()
  const stats = useMemo(() => {
    const ranked = [...coins]
      .filter((coin) => (coin.market_cap ?? 0) > 0)
      .sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0))
    const total = ranked.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0)
    const top3Coins = ranked.slice(0, 3)
    const next7Coins = ranked.slice(3, 10)
    const restCoins = ranked.slice(10)
    const top3 = top3Coins.reduce(
      (sum, coin) => sum + (coin.market_cap ?? 0),
      0,
    )
    const top10 = [...top3Coins, ...next7Coins].reduce(
      (sum, coin) => sum + (coin.market_cap ?? 0),
      0,
    )
    const composition = (segment: CoinsList[]) => ({
      symbols: segment.slice(0, 3).map((coin) => coin.symbol.toUpperCase()),
      remaining: Math.max(segment.length - 3, 0),
    })
    return {
      total,
      top10Share: total ? (top10 / total) * 100 : 0,
      segments: [
        {
          label: 'Top 3',
          ...composition(top3Coins),
          amount: top3,
          value: total ? (top3 / total) * 100 : 0,
          color: 'bg-primary',
        },
        {
          label: 'Next 7',
          ...composition(next7Coins),
          amount: top10 - top3,
          value: total ? ((top10 - top3) / total) * 100 : 0,
          color: 'bg-primary/55',
        },
        {
          label: 'Rest',
          ...composition(restCoins),
          amount: total - top10,
          value: total ? ((total - top10) / total) * 100 : 0,
          color: 'bg-muted-foreground/45',
        },
      ],
    }
  }, [coins])
  return (
    <section className='flex min-h-0 flex-col rounded-xl border border-border/30 bg-linear-to-br from-card to-background p-4'>
      <MarketSectionHeader
        icon={ChartPie}
        title='Market concentration'
        description='How much of the tracked market is controlled by its largest assets.'
        tooltip={
          <>
            Compares the market cap held by the{' '}
            <span className='font-semibold text-primary'>top 3</span>, the next
            7 and the remaining assets within the{' '}
            <span className='font-semibold text-foreground'>top 250</span>.
          </>
        }
        badge='Top 250'
      />
      {isLoading ? (
        <div className='grid flex-1 items-center gap-3 sm:grid-cols-[13rem_minmax(0,1fr)]'>
          <Skeleton className='mx-auto size-44 rounded-full' />
          <div className='space-y-1.5'>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className='h-14 rounded-xl' />
            ))}
          </div>
        </div>
      ) : (
        <div className='flex flex-1 flex-col'>
          <div className='rounded-lg bg-muted/45 px-3 py-2'>
            <p className='text-xs text-muted-foreground'>Tracked market cap</p>
            <p className='mt-0.5 text-xl font-bold tabular-nums'>
              {format(stats.total, { notation: 'compact' })}
            </p>
          </div>
          <div className='mt-2 grid flex-1 items-center gap-3 sm:grid-cols-[13rem_minmax(0,1fr)]'>
            <div className='relative mx-auto flex size-44 items-center justify-center'>
              <div
                className='absolute inset-0 rounded-full'
                style={{
                  background: `conic-gradient(
                    var(--primary) 0 ${stats.segments[0].value}%,
                    color-mix(in oklab, var(--primary) 55%, transparent) ${stats.segments[0].value}% ${stats.segments[0].value + stats.segments[1].value}%,
                    color-mix(in oklab, var(--muted-foreground) 45%, transparent) ${stats.segments[0].value + stats.segments[1].value}% 100%
                  )`,
                }}
              />
              <div className='absolute inset-4.5 rounded-full bg-card' />
              <div className='relative text-center'>
                <p className='text-2xl font-bold tabular-nums'>
                  {stats.top10Share.toFixed(1)}%
                </p>
                <p className='text-xs text-muted-foreground'>Top 10 share</p>
              </div>
            </div>
            <div className='space-y-1.5'>
              {stats.segments.map((segment) => (
                <div
                  key={segment.label}
                  className='rounded-xl border border-border/60 bg-muted/40 p-2'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
                      <span
                        className={`size-2.5 rounded-sm ${segment.color}`}
                      />
                      {segment.label}
                    </div>
                    <span className='text-lg font-bold tabular-nums'>
                      {format(segment.amount, { notation: 'compact' })}
                    </span>
                  </div>
                  <div className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <span className='font-semibold text-foreground tabular-nums'>
                      {segment.value.toFixed(1)}%
                    </span>
                    <span aria-hidden='true'>·</span>
                    <span className='truncate'>
                      {segment.symbols.join(' / ')}
                      {segment.remaining > 0 && ` +${segment.remaining}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
