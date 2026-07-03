import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, Star, Check, Loader2, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTrending } from '@/features/market/hooks/coins-queries'
import { useCurrency } from '@/features/currency/hooks'
import { useWatchlistStore } from '../store/watchlist-store'
import { coinsApi } from '@/features/market/api/coins-api'
import { coinToWatchlistCoin } from '../store/watchlist-store'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { TrendingCoin } from '@/features/market/types/trending'

// Sparkline

function TrendingSparkline({ sparkline }: { sparkline: string }) {
  if (!sparkline) return <div className='h-10' />
  if (sparkline.startsWith('<svg')) {
    return (
      <div
        className='h-10 w-24 [&_svg]:w-full [&_svg]:h-full'
        dangerouslySetInnerHTML={{ __html: sparkline }}
      />
    )
  }
  return <img src={sparkline} alt='' className='h-10 w-24 object-contain' />
}

// Card

function TrendingCard({
  coin,
  selected,
  onToggle,
  adding,
}: {
  coin: TrendingCoin
  selected: boolean
  onToggle: () => void
  adding: boolean
}) {
  const { format } = useCurrency()
  const change24h = coin.data.price_change_percentage_24h?.usd ?? 0
  const positive = change24h >= 0
  const price = coin.data.price

  return (
    <div
      onClick={!adding ? onToggle : undefined}
      className={cn(
        'rounded-xl border p-3 sm:p-4 transition-all duration-200 ',
        adding && 'pointer-events-none',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer'
          : 'border-border/20 bg-linear-to-br from-card to-background hover:from-card/90 hover:to-background/70 cursor-pointer',
      )}
    >
      <div className='flex items-center justify-between gap-1 mb-1'>
        <div className='flex items-center gap-2 min-w-0'>
          <img
            src={coin.small}
            alt={coin.name}
            className='h-5 w-5 rounded-full shrink-0'
          />
          <span className='text-base font-semibold truncate'>{coin.name}</span>
          <Badge variant='secondary' className='text-xs font-semibold'>
            {coin.symbol.toUpperCase()}
          </Badge>
        </div>
        <div
          className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
            adding
              ? 'bg-primary/20 text-primary'
              : selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground',
          )}
        >
          {adding ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : selected ? (
            <Check className='h-3.5 w-3.5' />
          ) : (
            <Plus className='h-3.5 w-3.5' />
          )}
        </div>
      </div>

      <div className='flex items-baseline gap-2 flex-wrap mb-5'>
        <span className='text-base sm:text-lg font-bold font-mono'>
          {format(price, { maximumFractionDigits: price < 1 ? 6 : 2 })}
        </span>
        <span
          className={cn(
            'text-xs font-mono font-medium inline-flex items-center gap-0.5',
            positive
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-destructive',
          )}
        >
          {positive ? '+' : ''}
          {change24h.toFixed(2)}%
        </span>
      </div>

      <div className='flex justify-start'>
        <TrendingSparkline sparkline={coin.data.sparkline} />
      </div>
    </div>
  )
}

// Main

export function WatchlistEmpty() {
  const addCoin = useWatchlistStore((s) => s.addCoin)
  const { data: trending, isLoading } = useTrending()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())

  const coins = (trending?.coins?.map((c) => c.item) ?? [])
    .sort((a, b) => (b.data.price ?? 0) - (a.data.price ?? 0))
    .slice(0, 6)

  const selectedCount = selected.size
  const isAdding = addingIds.size > 0

  const toggleSelect = (id: string) => {
    if (isAdding) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddSelected = async () => {
    if (selectedCount === 0 || isAdding) return

    setAddingIds(new Set(selected))
    const selectedCoins = coins.filter((c) => selected.has(c.id))

    try {
      const fullCoins = await Promise.all(
        selectedCoins.map((coin) => coinsApi.getCoin(coin.id)),
      )

      await new Promise((resolve) => setTimeout(resolve, 500))

      fullCoins.forEach((fullCoin) => {
        addCoin(coinToWatchlistCoin(fullCoin))
      })

      setSelected(new Set())
    } catch {
      // toast error
    } finally {
      setAddingIds(new Set())
    }
  }

  return (
    <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8'>
      {/* Header */}
      <div className='mb-6 text-center'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15'>
          <Star className='h-7 w-7 fill-amber-400 text-amber-400' />
        </div>
        <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
          Add Coins to Your Watchlist
        </h1>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl mb-6'>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-32 rounded-xl' />
            ))
          : coins.map((coin) => (
              <TrendingCard
                key={coin.id}
                coin={coin}
                selected={selected.has(coin.id)}
                onToggle={() => toggleSelect(coin.id)}
                adding={addingIds.has(coin.id)}
              />
            ))}
      </div>

      {/* Action Button */}
      <Button
        asChild={selectedCount === 0}
        onClick={selectedCount > 0 ? handleAddSelected : undefined}
        disabled={isAdding}
        variant={selectedCount > 0 ? 'default' : 'outline'}
        className={cn(
          'gap-2 w-56',
          selectedCount === 0 && 'text-muted-foreground hover:text-foreground',
        )}
      >
        {selectedCount > 0 ? (
          <span className='flex items-center justify-center gap-2 font-semibold text-base text-background'>
            <Check className='h-4 w-4' />
            Add {selectedCount} to Watchlist
          </span>
        ) : (
          <Link to='/' className='flex items-center justify-center gap-2'>
            <Search className='h-4 w-4' />
            Search for More Coins
          </Link>
        )}
      </Button>
    </div>
  )
}
