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
      <div className='flex justify-between'>
        <div className='flex gap-1.5 items-center'>
          <img src={coin.image.thumb} alt={coin.name} />
          <p className='font-bold text-xl'>{coin.name}</p>
          <p className='text-muted-foreground text-sm'>
            {coin.symbol.toUpperCase()}
          </p>
          <Badge variant='secondary' className='rounded-md'>
            #{coin.market_cap_rank}
          </Badge>
        </div>
        <div className=' flex gap-1'>
          <Button variant='secondary'>
            <Star />
            {new Intl.NumberFormat('en', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(coin.watchlist_portfolio_users)}
          </Button>
          <Button variant='secondary' onClick={handleCopy}>
            {copied ? <Check /> : <Share />}
          </Button>
        </div>
      </div>
      <div className='flex gap-3 items-center'>
        <p className='font-bold text-3xl'>
          {coin.market_data.current_price.usd.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>

        <p
          className={` inline-flex items-center font-bold text-md ${
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
