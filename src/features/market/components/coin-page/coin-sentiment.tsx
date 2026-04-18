import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'
import type { Coin } from '../../types/coin'
import { Skeleton } from '@/shared/ui/skeleton'

export function CoinSentiment({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  if (!coin) {
    return (
      <div className='flex flex-col gap-2 border-ring rounded-md'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-md'>Community Sentiment</span>
          <Gauge className='w-4 h-4' />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-muted-foreground'>
            Bullish
          </span>
          <Skeleton className='h-3 flex-1' />
          <span className='text-xs font-bold text-muted-foreground'>
            Bearish
          </span>
        </div>
      </div>
    )
  }

  const hasSentiment =
    coin.sentiment_votes_up_percentage != null &&
    coin.sentiment_votes_down_percentage != null

  const up = coin.sentiment_votes_up_percentage ?? 0
  const down = coin.sentiment_votes_down_percentage ?? 0

  return (
    <div className='flex flex-col gap-2 border-ring rounded-md'>
      <div className='flex items-center gap-2'>
        <span className='font-bold text-md'>Community Sentiment</span>
        <Gauge className='w-4 h-4' />
      </div>

      <div className='flex items-center gap-2'>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${hasSentiment ? 'text-emerald-500' : 'text-muted-foreground'}`}
        >
          <TrendingUp className='w-4 h-4' />
          {isLoading ? (
            <Skeleton className='h-4 w-8' />
          ) : hasSentiment ? (
            `${up}%`
          ) : (
            '—'
          )}
        </div>

        <div className='relative flex-1 h-2 rounded overflow-hidden flex bg-muted'>
          {isLoading ? (
            <Skeleton className='h-full w-full' />
          ) : hasSentiment ? (
            <>
              <div
                className='h-full bg-emerald-500'
                style={{ width: `${up}%` }}
              />
              <div
                className='h-full bg-red-500'
                style={{ width: `${down}%` }}
              />
            </>
          ) : (
            <div className='absolute inset-0 flex items-center justify-center text-xs text-muted-foreground'>
              No sentiment data
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-bold ${hasSentiment ? 'text-red-500' : 'text-muted-foreground'}`}
        >
          {isLoading ? (
            <Skeleton className='h-4 w-8' />
          ) : hasSentiment ? (
            `${down}%`
          ) : (
            '—'
          )}
          <TrendingDown className='w-4 h-4' />
        </div>
      </div>
    </div>
  )
}
