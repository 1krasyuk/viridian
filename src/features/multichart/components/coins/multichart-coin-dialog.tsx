import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useCurrency } from '@/features/currency/hooks'
import { useCoins } from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
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
import { MAX_CHARTS } from '../../types/constants'
import type { SortBy } from '../../types/types'
import { CoinPickerCard } from './multichart-coin-picker'

export function CoinPicker({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  onSelect: (coins: CoinsList[]) => void
}) {
  const { currency } = useCurrency()
  const {
    data = [],
    isLoading,
    isError,
  } = useCoins(1, 250, undefined, currency, open, Infinity, false, Infinity)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rank')
  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set())
  const coins = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = data.filter(
      (coin) =>
        !normalized ||
        coin.name.toLowerCase().includes(normalized) ||
        coin.symbol.toLowerCase().includes(normalized),
    )
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rank')
        return (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity)
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setSelectedCoins(new Set())
      }}
    >
      <DialogContent className='flex h-[min(46rem,calc(100dvh-2rem))] flex-col gap-3 rounded-xl bg-card p-0 sm:max-w-5xl!'>
        <DialogHeader className='px-5 pt-5'>
          <DialogTitle>Add coins</DialogTitle>
          <DialogDescription>
            Choose several coins from the top 250 and add them together.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-2 px-5 sm:grid-cols-[1fr_11rem]'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search coins…'
              className='rounded-md pl-9'
              autoFocus
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
        <ScrollArea className='min-h-0 flex-1 border-y'>
          <div className='grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-3'>
            {isLoading &&
              Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className='h-44 rounded-xl' />
              ))}
            {isError && (
              <p className='col-span-full flex min-h-80 items-center justify-center text-center text-sm text-destructive'>
                Could not load coins.
              </p>
            )}
            {!isLoading && !isError && coins.length === 0 && (
              <p className='col-span-full flex min-h-80 items-center justify-center text-center text-sm text-muted-foreground'>
                No coins found.
              </p>
            )}
            {coins.map((coin) => (
              <CoinPickerCard
                key={coin.id}
                coin={coin}
                alreadyAdded={selectedIds.has(coin.id)}
                selected={selectedCoins.has(coin.id)}
                onToggle={() =>
                  setSelectedCoins((current) => {
                    const next = new Set(current)
                    if (next.has(coin.id)) next.delete(coin.id)
                    else if (next.size < MAX_CHARTS - selectedIds.size)
                      next.add(coin.id)
                    return next
                  })
                }
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className='px-5 pb-5 sm:justify-between!'>
          <DialogClose asChild>
            <Button variant='destructive'>Cancel</Button>
          </DialogClose>
          <Button
            variant='soft'
            disabled={selectedCoins.size === 0}
            onClick={() => {
              onSelect(data.filter((coin) => selectedCoins.has(coin.id)))
              setSelectedCoins(new Set())
            }}
          >
            <Check /> Confirm
            {selectedCoins.size ? ` (${selectedCoins.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
