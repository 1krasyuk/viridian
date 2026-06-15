import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/button'
import type { Coin } from '../../../types/coin'
import { Badge } from '@/shared/ui/badge'
import { Star, Share, Check } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import {
  coinToWatchlistCoin,
  useWatchlistStore,
} from '@/features/watchlist/store/watchlist-store'

export function CoinHeader({
  coin,
  isLoading,
  days,
}: {
  coin: Coin | undefined
  isLoading?: boolean
  days?: string
}) {
  const [copied, setCopied] = useState(false)
  const isWatched = useWatchlistStore((state) =>
    coin ? state.isWatched(coin.id) : false,
  )
  const addCoin = useWatchlistStore((state) => state.addCoin)
  const toggleCoin = useWatchlistStore((state) => state.toggleCoin)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!coin || !isWatched) return
    addCoin(coinToWatchlistCoin(coin))
  }, [addCoin, coin, isWatched])

  if (isLoading || !coin) {
    return (
      <div className='w-full space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-1 min-w-40 flex-1'>
            <Skeleton className='h-5 w-5 rounded-full' />
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-8' />
            <Skeleton className='h-5 w-7' />
          </div>
          <div className='flex gap-1'>
            <Button variant='secondary' size='sm' disabled className='gap-1.5'>
              <Star />
              <Skeleton className='h-4 w-8' />
            </Button>

            <Button
              variant='secondary'
              size='icon'
              disabled
              className='size-8'
            >
              <Share className='opacity-50' />
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='h-6 w-20' />
        </div>
      </div>
    )
  }

  const getPriceChange = () => {
    if (!coin?.market_data) return null

    switch (days) {
      case '1':
        return coin.market_data.price_change_percentage_24h
      case '7':
        return coin.market_data.price_change_percentage_7d_in_currency
      case '30':
        return coin.market_data.price_change_percentage_30d_in_currency
      case '90':
        return coin.market_data.price_change_percentage_60d_in_currency
      case '365':
        return coin.market_data.price_change_percentage_1y_in_currency
      case 'ytd':
        return coin.market_data.price_change_percentage_1y_in_currency
      default:
        return null
    }
  }

  const normalizePriceChange = (
    value: number | Record<string, number> | null | undefined,
  ): number | null => {
    if (value == null) return null
    if (typeof value === 'number') return value

    const v = value.usd
    return typeof v === 'number' ? v : null
  }
  const label =
    days === '1'
      ? '(24h)'
      : days === '7'
        ? '(7d)'
        : days === '30'
          ? '(1m)'
          : days === '90'
            ? '(3m)'
            : days === '365'
              ? '(1y)'
              : days === 'ytdDays'
                ? 'ytd'
                : '(YTD)'

  const priceChangeRaw = getPriceChange()
  const priceChange = normalizePriceChange(priceChangeRaw)
  const watchlistCount = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(coin.watchlist_portfolio_users)

  const handleWatchlistToggle = () => {
    toggleCoin(coinToWatchlistCoin(coin))
  }

  return (
    <div className='w-full space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-1.5 min-w-40 flex-1'>
          <img
            src={coin.image.thumb}
            alt={coin.name}
            className='rounded-full shrink-0'
          />

          <p className='font-bold text-xl truncate max-w-30' title={coin.name}>
            {coin.name}
          </p>
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
          <Button
            variant='secondary'
            size='sm'
            className='gap-1.5'
            onClick={handleWatchlistToggle}
          >
            <Star
              className={cn(
                'shrink-0',
                isWatched && 'fill-foreground text-foreground',
              )}
            />
            <span>{watchlistCount}</span>
          </Button>
          <Button
            variant='secondary'
            onClick={handleCopy}
            size='sm'
            className='size-8'
          >
            {copied ? (
              <Check />
            ) : (
              <Share />
            )}
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
          className={`inline-flex items-center font-bold text-md ${priceChange == null
            ? 'text-gray-400'
            : priceChange >= 0
              ? 'text-emerald-500'
              : 'text-red-500'
            }`}
        >
          <span className='inline-block scale-x-150 scale-y-80 mr-1 text-xs'>
            {priceChange == null ? '—' : priceChange >= 0 ? '▲' : '▼'}
          </span>
          {priceChange != null ? priceChange.toFixed(2) : ''}% {label}
        </p>
      </div>
    </div>
  )
}
