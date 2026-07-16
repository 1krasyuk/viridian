import { Link } from '@tanstack/react-router'
import { Activity, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import type { CoinsList } from '@/features/market/types/coins-list'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

import { MarketSectionHeader } from './market-section-header'

function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function MarketBreadthSkeleton() {
  return (
    <div className='grid flex-1 gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]'>
      <Skeleton className='min-h-64 rounded-xl' />
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-1'>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className='h-14 rounded-xl' />
        ))}
      </div>
    </div>
  )
}

export function MarketBreadth({
  coins,
  isLoading,
}: {
  coins: CoinsList[]
  isLoading: boolean
}) {
  const values = coins
    .map((coin) => coin.price_change_percentage_24h)
    .filter((value): value is number => Number.isFinite(value))
  const rising = values.filter((value) => value > 0).length
  const falling = values.filter((value) => value < 0).length
  const unchanged = Math.max(0, values.length - rising - falling)
  const medianChange = median(values)
  const bins = [
    {
      label: '13%',
      count: values.filter((value) => value < -10).length,
      color: 'bg-destructive/40',
    },
    {
      label: '8%',
      count: values.filter((value) => value >= -10 && value < -5).length,
      color: 'bg-destructive/60',
    },
    {
      label: '3%',
      count: values.filter((value) => value >= -5 && value < 0).length,
      color: 'bg-destructive/80',
    },
    {
      label: '3%',
      count: values.filter((value) => value >= 0 && value < 5).length,
      color: 'bg-primary/80',
    },
    {
      label: '8%',
      count: values.filter((value) => value >= 5 && value < 10).length,
      color: 'bg-primary/60',
    },
    {
      label: '13%',
      count: values.filter((value) => value >= 10).length,
      color: 'bg-primary/40',
    },
  ]
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1)

  return (
    <section className='flex min-h-0 flex-col rounded-xl border border-border/30 bg-linear-to-br from-card to-background p-4'>
      <MarketSectionHeader
        icon={Activity}
        title='Market breadth'
        description={
          <>
            A quick view of 24-hour return distribution.{' '}
            <Link
              to='/heatmap'
              className='font-medium text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground'
            >
              Explore the full market heatmap
            </Link>
          </>
        }
        tooltip={
          <>
            Each column counts assets within a{' '}
            <span className='font-semibold text-foreground'>
              24-hour return range
            </span>
            . Red buckets declined, while green buckets advanced.
          </>
        }
        badge='Top 250'
      />

      {isLoading ? (
        <MarketBreadthSkeleton />
      ) : (
        <div className='grid flex-1 gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]'>
          <div className='relative flex min-h-64 rounded-xl border border-border/60 bg-background/35 px-4 pt-5 pb-3'>
            <div className='pointer-events-none absolute top-4 bottom-9 left-1/2 border-l border-dashed border-border' />
            <span className='absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-card px-1.5 text-[9px] font-medium text-muted-foreground'>
              0%
            </span>
            <div className='grid w-full grid-cols-6 items-end gap-2'>
              {bins.map((bin) => (
                <div
                  key={bin.label}
                  className='flex h-full min-w-0 flex-col justify-end text-center'
                >
                  <div className='flex min-h-0 flex-1 items-end'>
                    <div
                      className={`relative w-full rounded-t-md ${bin.color}`}
                      style={{
                        height: `${Math.max((bin.count / maxCount) * 100, 3)}%`,
                      }}
                    >
                      <span className='absolute inset-x-0 bottom-full mb-1.5 text-xs font-bold leading-none tabular-nums'>
                        {bin.count}
                      </span>
                    </div>
                  </div>
                  <span className='mt-2 truncate text-[10px] font-medium text-muted-foreground'>
                    {bin.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 sm:grid-cols-1'>
            <div className='flex flex-col justify-center rounded-xl border border-border/60 bg-muted/45 p-3 py-2'>
              <p className='text-xs text-muted-foreground'>Median 24H</p>
              <p
                className={cn(
                  'mt-1 text-2xl font-bold tabular-nums',
                  medianChange >= 0 ? 'text-emerald-500' : 'text-destructive',
                )}
              >
                {medianChange >= 0 ? '+' : ''}
                {medianChange.toFixed(2)}%
              </p>
            </div>
            <div className='flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 py-2'>
              <TrendingUp className='size-5 text-emerald-500' />
              <div>
                <p className='text-xs text-muted-foreground'>Rising</p>
                <p className='text-lg font-bold tabular-nums'>{rising}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 py-2'>
              <TrendingDown className='size-5 text-destructive' />
              <div>
                <p className='text-xs text-muted-foreground'>Falling</p>
                <p className='text-lg font-bold tabular-nums'>{falling}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-xl border border-border/70 bg-muted/65 p-3 py-2'>
              <Minus className='size-5 text-muted-foreground' />
              <div>
                <p className='text-xs text-muted-foreground'>Unchanged</p>
                <p className='text-lg font-bold tabular-nums'>{unchanged}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
