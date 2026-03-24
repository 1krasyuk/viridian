import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'
import type { Coin } from '../../types/coin'

export function CoinSentiment({ coin }: { coin: Coin }) {
  return (
    <div className='flex flex-col gap-2   border-ring rounded-md'>
      {/* Header */}
      <div className='flex items-center gap-2 '>
        <span className='font-bold text-md'>Community Sentiment</span>
        <Gauge className='w-4 h-4' />
      </div>

      {/* Bar + values */}
      <div className='flex items-center gap-2'>
        {/* Bullish */}
        <div className='flex items-center gap-1 text-emerald-500 text-xs font-bold'>
          <TrendingUp className='w-4 h-4' />
          {coin.sentiment_votes_up_percentage}%
        </div>

        {/* Bar */}
        <div className='flex-1 h-2 rounded overflow-hidden flex'>
          <div
            className='h-full bg-emerald-500'
            style={{ width: `${coin.sentiment_votes_up_percentage}%` }}
          />
          <div
            className='h-full bg-red-500'
            style={{ width: `${coin.sentiment_votes_down_percentage}%` }}
          />
        </div>

        {/* Bearish */}
        <div className='flex items-center gap-1 text-red-500 text-xs font-bold'>
          {coin.sentiment_votes_down_percentage}%
          <TrendingDown className='w-4 h-4' />
        </div>
      </div>
    </div>
  )
}
