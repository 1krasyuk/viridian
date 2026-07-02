import { useRef, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import type { TrendingResponse } from '@/features/market/types/trending'
import { Link } from '@tanstack/react-router'

interface MarketTickerProps {
  data: TrendingResponse | undefined
  isLoading: boolean
}

function TickerItem({
  id,
  symbol,
  name,
  price,
  change,
  rank,
  iconUrl,
}: {
  id: string
  symbol: string
  name: string
  price: string
  change: number
  rank: number
  iconUrl?: string
}) {
  const isPositive = change >= 0
  const isNegative = change < 0

  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: id }}
      className='inline-flex items-center gap-2 px-3 py-2.5 hover:bg-muted/60 transition-colors cursor-pointer shrink-0'
    >
      {/* Rank */}
      <span className='text-xs font-mono text-muted-foreground tabular-nums'>
        #{rank}
      </span>
      {/* Icon */}
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={symbol}
          className='w-5 h-5 rounded-full shrink-0'
          loading='lazy'
        />
      ) : (
        <div className='w-5 h-5 rounded-full bg-muted shrink-0' />
      )}
      {/* Full name */}
      <span className='text-sm font-semibold text-foreground truncate max-w-25'>
        {name}
      </span>
      {/* Symbol badge */}
      <Badge
        variant='secondary'
        className='h-5 px-1.5 text-xs text-muted-foreground font-semibold font-mono uppercase tracking-wide bg-input '
      >
        {symbol}
      </Badge>
      {/* Price */}
      <span className='text-sm font-mono font-semibold tabular-nums'>
        ${price}
      </span>
      {/* Change */}
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium ${
          isPositive
            ? 'text-emerald-500'
            : isNegative
              ? 'text-red-500'
              : 'text-muted-foreground'
        }`}
      >
        {isPositive ? (
          <TrendingUp className='h-3.5 w-3.5' />
        ) : isNegative ? (
          <TrendingDown className='h-3.5 w-3.5' />
        ) : (
          <Minus className='h-3.5 w-3.5' />
        )}
        {Math.abs(change).toFixed(2)}%
      </span>
    </Link>
  )
}

export function MarketTicker({ data, isLoading }: MarketTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const scrollPosRef = useRef(0)

  const startAnimation = useCallback(() => {
    const el = scrollRef.current
    if (!el || isLoading) return

    const animate = () => {
      if (!el) return
      scrollPosRef.current += 0.5
      if (scrollPosRef.current >= el.scrollWidth / 2) {
        scrollPosRef.current = 0
      }
      el.scrollLeft = scrollPosRef.current
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isLoading])

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      startAnimation()
    }
    return () => stopAnimation()
  }, [isLoading, startAnimation, stopAnimation])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation()
      } else {
        startAnimation()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility)
  }, [startAnimation, stopAnimation])

  const coins = data?.coins ?? []
  const duplicatedCoins = [...coins, ...coins]

  return (
    <div className='relative w-full overflow-hidden border-y border-border/15 bg-card'>
      <div
        ref={scrollRef}
        className='flex items-center overflow-hidden'
        style={{ scrollBehavior: 'auto' }}
      >
        {isLoading ? (
          <div className='flex items-center gap-3 px-3 py-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-6 w-56 shrink-0 rounded-lg' />
            ))}
          </div>
        ) : duplicatedCoins.length === 0 ? (
          <div className='px-3 py-3 text-xs text-muted-foreground'>
            No trending data
          </div>
        ) : (
          duplicatedCoins.map((coin, i) => {
            const item = coin.item
            const price = item.data?.price ?? 0
            const change = item.data?.price_change_percentage_24h?.usd ?? 0
            const isLast = i === duplicatedCoins.length - 1

            return (
              <div
                key={`${item.id}-${i}`}
                className='inline-flex items-center shrink-0'
              >
                <TickerItem
                  id={item.id}
                  symbol={item.symbol}
                  name={item.name}
                  iconUrl={item.small}
                  price={
                    price >= 1
                      ? price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : price >= 0.01
                        ? price.toFixed(4)
                        : price.toFixed(6)
                  }
                  change={change}
                  rank={item.market_cap_rank}
                />
                {!isLast && (
                  <div className='h-4 w-px bg-muted-foreground/50 shrink-0' />
                )}
              </div>
            )
          })
        )}
      </div>

      <div className='pointer-events-none absolute inset-y-0 left-0 w-5 bg-linear-to-r from-card to-transparent z-10' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-5 bg-linear-to-l from-card to-transparent z-10' />
    </div>
  )
}
