import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { useCoins } from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { cn } from '@/shared/lib/utils'
import type { SortBy } from '../../types/types'

function Change({ value }: { value: number | null }) {
  if (value == null) return <span className='text-muted-foreground'>—</span>
  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        value >= 0 ? 'text-emerald-500' : 'text-red-500',
      )}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

export function CoinScreenerSheet({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  onSelect: (coin: CoinsList) => void
}) {
  const { currency, format } = useCurrency()
  const { data = [], isLoading } = useCoins(
    1,
    250,
    undefined,
    currency,
    open,
    1000 * 60 * 5,
    false,
    1000 * 60 * 30,
  )
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rank')
  const coins = useMemo(() => {
    const value = query.trim().toLowerCase()
    return data
      .filter(
        (coin) =>
          !value ||
          coin.name.toLowerCase().includes(value) ||
          coin.symbol.toLowerCase().includes(value),
      )
      .sort((a, b) => {
        if (sortBy === 'rank')
          return (
            (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity)
          )
        const key =
          sortBy === 'price'
            ? 'current_price'
            : sortBy === 'market_cap'
              ? 'market_cap'
              : 'total_volume'
        return (b[key] ?? 0) - (a[key] ?? 0)
      })
  }, [data, query, sortBy])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        showOverlay={false}
        className='w-85! gap-0 p-0 sm:max-w-xs'
      >
        <SheetHeader className='px-4 pb-4 pt-5'>
          <SheetTitle>Coin screener</SheetTitle>
          <SheetDescription>
            Click a coin to add it immediately.
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-2 px-4 pb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search top 250…'
              className='rounded-md pl-9'
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <SelectTrigger className='w-full rounded-md'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='rank'>Sort by rank</SelectItem>
              <SelectItem value='price'>Sort by price</SelectItem>
              <SelectItem value='market_cap'>Sort by market cap</SelectItem>
              <SelectItem value='volume'>Sort by volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className='min-h-0 flex-1 border-t'>
          <div className='divide-y'>
            {isLoading &&
              Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className='mx-5 my-3 h-14' />
              ))}
            {coins.map((coin) => {
              const added = selectedIds.has(coin.id)
              return (
                <button
                  key={coin.id}
                  type='button'
                  disabled={added}
                  onClick={() => onSelect(coin)}
                  className='grid w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-3 overflow-hidden px-4 py-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-40'
                >
                  <img
                    src={coin.image}
                    alt=''
                    className='size-9 rounded-full'
                    loading='lazy'
                  />
                  <div className='min-w-0'>
                    <div className='flex min-w-0 items-center gap-2 overflow-hidden'>
                      <span className='truncate font-medium' title={coin.name}>
                        {coin.name}
                      </span>
                      <Badge variant='secondary' className='uppercase'>
                        {coin.symbol}
                      </Badge>
                    </div>
                    <div className='mt-1 flex gap-3 text-xs'>
                      <span>
                        1H{' '}
                        <Change
                          value={coin.price_change_percentage_1h_in_currency}
                        />
                      </span>
                      <span>
                        24H <Change value={coin.price_change_percentage_24h} />
                      </span>
                    </div>
                  </div>
                  <div className='min-w-0 overflow-hidden text-right text-xs'>
                    <div className='truncate font-semibold'>
                      {format(coin.current_price, { maximumFractionDigits: 6 })}
                    </div>
                    <div className='truncate text-muted-foreground'>
                      {format(coin.market_cap, { notation: 'compact' })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
