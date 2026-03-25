import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import type { Coin } from '../../types/coin'
import { Badge } from '@/shared/ui/badge'
import { Star, Share, Check } from 'lucide-react'

export function CoinHeader({ coin }: { coin: Coin }) {
  const priceChange = coin.market_data.price_change_percentage_24h

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='w-full space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-1.5 min-w-40 flex-1'>
          <img src={coin.image.thumb} alt={coin.name} className='shrink-0' />
          <p className='font-bold text-xl truncate'>{coin.name}</p>
          <p className='text-muted-foreground text-sm shrink-0'>
            {coin.symbol.toUpperCase()}
          </p>
          {coin.market_cap_rank != null && (
            <Badge variant='secondary' className='rounded-md shrink-0'>
              #{coin.market_cap_rank}
            </Badge>
          )}
        </div>
        <div className='flex gap-1'>
          <Button variant='secondary' size='sm'>
            <Star />
            {new Intl.NumberFormat('en', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(coin.watchlist_portfolio_users)}
          </Button>
          <Button variant='secondary' onClick={handleCopy} size='sm'>
            {copied ? <Check /> : <Share />}
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <p className='font-bold text-3xl'>
          {coin.market_data.current_price.usd.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>

        <p
          className={`inline-flex items-center font-bold text-md ${
            priceChange == null
              ? 'text-gray-400'
              : priceChange >= 0
                ? 'text-emerald-500'
                : 'text-red-500'
          }`}
        >
          <span className='inline-block scale-x-150 scale-y-80 mr-1 text-xs'>
            {priceChange == null ? '—' : priceChange >= 0 ? '▲' : '▼'}
          </span>
          {priceChange != null ? priceChange.toFixed(2) : ''}% (24h)
        </p>
      </div>
    </div>
  )
}
