import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'
import type { Coin } from '../../types/coin'
export function CoinSentiment({ coin }: { coin: Coin }) {
  const hasSentiment =
    coin.sentiment_votes_up_percentage != null &&
    coin.sentiment_votes_down_percentage != null

  const up = coin.sentiment_votes_up_percentage ?? 0
  const down = coin.sentiment_votes_down_percentage ?? 0

  return (
    <div className='flex flex-col gap-2 border-ring rounded-md'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <span className='font-bold text-md'>Community Sentiment</span>
        <Gauge className='w-4 h-4' />
      </div>

      <div className='flex items-center gap-2'>
        {/* Bullish */}
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            hasSentiment ? 'text-emerald-500' : 'text-muted-foreground'
          }`}
        >
          <TrendingUp className='w-4 h-4' />
          {hasSentiment ? `${up}%` : '—'}
        </div>

        {/* Bar */}
        <div className='relative flex-1 h-2 rounded overflow-hidden flex bg-muted'>
          {hasSentiment ? (
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

        {/* Bearish */}
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            hasSentiment ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {hasSentiment ? `${down}%` : '—'}
          <TrendingDown className='w-4 h-4' />
        </div>
      </div>
    </div>
  )
}
