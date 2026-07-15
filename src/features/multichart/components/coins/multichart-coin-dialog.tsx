import { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  Search,
  TrendingUp,
} from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { useCoins, useTrending } from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import { SearchHeader } from '@/features/search/components/search-header'
import { useSearchQuery } from '@/features/search/hooks/use-search-query'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from '@/shared/ui/dialog'
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

function CoinPickerSkeletons({ count = 9 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className='h-44 rounded-xl' />
      ))}
    </>
  )
}

function CoinGrid({
  coins,
  isLoading,
  isError,
  selectedIds,
  selectedCoins,
  onToggle,
  columns = 'two',
}: {
  coins: CoinsList[]
  isLoading: boolean
  isError: boolean
  selectedIds: Set<string>
  selectedCoins: Map<string, CoinsList>
  onToggle: (coin: CoinsList) => void
  columns?: 'one' | 'two' | 'three'
}) {
  const columnClass =
    columns === 'one'
      ? 'grid-cols-1'
      : columns === 'three'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid gap-2.5 pr-1 ${columnClass}`}>
      {isLoading && <CoinPickerSkeletons count={columns === 'one' ? 5 : 10} />}
      {!isLoading && isError && (
        <p className='col-span-full flex min-h-60 items-center justify-center text-center text-sm text-destructive'>
          Could not load coins.
        </p>
      )}
      {!isLoading && !isError && coins.length === 0 && (
        <p className='col-span-full flex min-h-60 items-center justify-center text-center text-sm text-muted-foreground'>
          No coins found.
        </p>
      )}
      {!isLoading &&
        !isError &&
        coins.map((coin) => (
          <CoinPickerCard
            key={coin.id}
            coin={coin}
            alreadyAdded={selectedIds.has(coin.id)}
            selected={selectedCoins.has(coin.id)}
            onToggle={() => onToggle(coin)}
          />
        ))}
    </div>
  )
}

export function CoinPicker({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
  title = 'Add coins to multichart',
  description = 'Search CoinGecko and select several coins to add together',
  confirmLabel = 'Add coins',
  maxSelection = MAX_CHARTS - selectedIds.size,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  onSelect: (coins: CoinsList[]) => void
  title?: string
  description?: string
  confirmLabel?: string
  maxSelection?: number
}) {
  const { currency } = useCurrency()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rank')
  const [showTrending, setShowTrending] = useState(true)
  const [selectedCoins, setSelectedCoins] = useState<Map<string, CoinsList>>(
    new Map(),
  )
  const hasQuery = query.trim().length > 0
  const search = useSearchQuery(query, open)

  const topCoinsQuery = useCoins(
    1,
    250,
    undefined,
    currency,
    open && !hasQuery,
    Infinity,
    false,
    Infinity,
    undefined,
    false,
  )
  const topCoins = useMemo(() => {
    const coins = [...(topCoinsQuery.data ?? [])]
    return coins.sort((a, b) => {
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
  }, [sortBy, topCoinsQuery.data])

  const trendingQuery = useTrending({
    enabled: open && !hasQuery,
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
  const trendingIds = useMemo(
    () => trendingQuery.data?.coins.map(({ item }) => item.id).join(',') ?? '',
    [trendingQuery.data],
  )
  const trendingMarketsQuery = useCoins(
    1,
    Math.max(trendingQuery.data?.coins.length ?? 1, 1),
    undefined,
    currency,
    open && !hasQuery && trendingIds.length > 0,
    1000 * 60 * 10,
    false,
    300000,
    trendingIds || undefined,
    false,
  )
  const trendingCoins = useMemo(() => {
    const marketsById = new Map(
      trendingMarketsQuery.data?.map((coin) => [coin.id, coin]) ?? [],
    )
    return (
      trendingQuery.data?.coins
        .map(({ item }) => marketsById.get(item.id))
        .filter((coin): coin is CoinsList => Boolean(coin)) ?? []
    )
  }, [trendingMarketsQuery.data, trendingQuery.data])

  const searchIds = useMemo(
    () => search.data?.coins.map((coin) => coin.id).join(',') ?? '',
    [search.data],
  )
  const searchMarketsQuery = useCoins(
    1,
    Math.max(search.data?.coins.length ?? 1, 1),
    undefined,
    currency,
    open && hasQuery && searchIds.length > 0,
    1000 * 60 * 5,
    false,
    300000,
    searchIds || undefined,
    false,
  )
  const searchedCoins = useMemo(() => {
    const marketsById = new Map(
      searchMarketsQuery.data?.map((coin) => [coin.id, coin]) ?? [],
    )
    return (
      search.data?.coins
        .map((coin) => marketsById.get(coin.id))
        .filter((coin): coin is CoinsList => Boolean(coin)) ?? []
    )
  }, [search.data, searchMarketsQuery.data])
  const isSearchLoading =
    search.isSearching ||
    (searchIds.length > 0 && searchMarketsQuery.isFetching)
  const isTrendingLoading =
    trendingQuery.isLoading ||
    (trendingMarketsQuery.isFetching && !trendingMarketsQuery.data)

  const reset = () => {
    setQuery('')
    setSortBy('rank')
    setSelectedCoins(new Map())
  }
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }
  const toggleCoin = (coin: CoinsList) => {
    setSelectedCoins((current) => {
      const next = new Map(current)
      if (next.has(coin.id)) next.delete(coin.id)
      else if (next.size < maxSelection) next.set(coin.id, coin)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='grid h-[min(46rem,calc(100dvh-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-xl bg-card p-4 sm:max-w-5xl!'
      >
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          title={title}
          description={description}
          placeholder='Search coins...'
        />

        <div className='no-scrollbar min-h-0 overflow-y-auto'>
          {hasQuery ? (
            <section className='flex h-full min-h-0 flex-col'>
              <div className='mb-2 flex min-h-8 shrink-0 items-center gap-2'>
                <span className='flex size-6 items-center justify-center'>
                  <Search className='size-5 text-foreground' />
                </span>
                <h2 className='text-lg font-semibold'>Found coins</h2>
              </div>
              <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
                <CoinGrid
                  coins={searchedCoins}
                  isLoading={isSearchLoading}
                  isError={search.isError || searchMarketsQuery.isError}
                  selectedIds={selectedIds}
                  selectedCoins={selectedCoins}
                  onToggle={toggleCoin}
                  columns='three'
                />
              </div>
            </section>
          ) : (
            <div className='space-y-5'>
              <section>
                <button
                  type='button'
                  aria-expanded={showTrending}
                  onClick={() => setShowTrending((current) => !current)}
                  className='mb-2 flex min-h-8 w-full items-center gap-2 text-left'
                >
                  <span className='flex size-6 items-center justify-center'>
                    <TrendingUp className='size-5 text-foreground' />
                  </span>
                  <h2 className='text-lg font-semibold'>Trending coins</h2>
                  <ChevronDown
                    className={`ml-auto size-5 text-muted-foreground transition-transform ${showTrending ? 'rotate-180' : ''}`}
                  />
                </button>
                {showTrending && (
                  <CoinGrid
                    coins={trendingCoins}
                    isLoading={isTrendingLoading}
                    isError={
                      trendingQuery.isError || trendingMarketsQuery.isError
                    }
                    selectedIds={selectedIds}
                    selectedCoins={selectedCoins}
                    onToggle={toggleCoin}
                    columns='three'
                  />
                )}
              </section>

              <section>
                <div className='mb-2 flex min-h-8 shrink-0 items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <span className='flex size-6 items-center justify-center'>
                      <CircleDollarSign className='size-5 text-foreground' />
                    </span>
                    <h2 className='text-lg font-semibold'>Top 250 coins</h2>
                  </div>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortBy)}
                  >
                    <SelectTrigger className='w-42 rounded-md'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='rank'>Sort by rank</SelectItem>
                      <SelectItem value='price'>Sort by price</SelectItem>
                      <SelectItem value='market_cap'>
                        Sort by market cap
                      </SelectItem>
                      <SelectItem value='volume'>Sort by volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CoinGrid
                  coins={topCoins}
                  isLoading={topCoinsQuery.isLoading}
                  isError={topCoinsQuery.isError}
                  selectedIds={selectedIds}
                  selectedCoins={selectedCoins}
                  onToggle={toggleCoin}
                  columns='three'
                />
              </section>
            </div>
          )}
        </div>

        <DialogFooter className='sm:justify-between!'>
          <DialogClose asChild>
            <Button variant='destructive'>Cancel</Button>
          </DialogClose>
          <Button
            variant='default'
            disabled={selectedCoins.size === 0}
            onClick={() => {
              onSelect([...selectedCoins.values()])
              reset()
            }}
          >
            <Check /> {confirmLabel}
            {selectedCoins.size ? ` (${selectedCoins.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
