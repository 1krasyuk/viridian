import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Eraser,
  FolderSearch,
  Search,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import {
  useCoins,
  useCoinSearch,
  useTrending,
} from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import type { SearchCategory, SearchCoin } from '@/features/market/types/search'
import { useWatchlistStore } from '@/features/watchlist/store/watchlist-store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { useRecentSearchesStore } from './recent-searches-store'

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}

function ResultSkeletons() {
  return (
    <div
      className='grid gap-2 sm:grid-cols-2'
      aria-label='Loading search results'
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className='flex items-center gap-3 rounded-md border border-border/60 p-3'
        >
          <Skeleton className='size-9 shrink-0 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-3.5 w-28 rounded-md' />
            <Skeleton className='h-3 w-14 rounded-md' />
          </div>
          <Skeleton className='h-5 w-10 rounded-full' />
        </div>
      ))}
    </div>
  )
}

function TrendingSkeletons() {
  return (
    <div className='grid gap-2'>
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className='h-27 rounded-xl' />
      ))}
    </div>
  )
}

function PriceChange({ value }: { value: number | null }) {
  if (value == null) return <span className='text-muted-foreground'>—</span>

  return (
    <span
      className={cn(
        'text-xs font-semibold tabular-nums',
        value >= 0 ? 'text-emerald-500' : 'text-destructive',
      )}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

function CoinSparkline({ coin }: { coin: CoinsList }) {
  const prices = coin.sparkline_in_7d?.price?.filter(Number.isFinite) ?? []
  if (prices.length < 2) return <div className='h-9 w-24' />

  const min = Math.min(...prices)
  const range = Math.max(...prices) - min || 1
  const points = prices
    .map(
      (price, index) =>
        `${(index / (prices.length - 1)) * 100},${36 - ((price - min) / range) * 32}`,
    )
    .join(' ')
  const path = `M ${points.replaceAll(' ', ' L ')}`
  const positive = prices.at(-1)! >= prices[0]

  return (
    <svg
      viewBox='0 0 100 40'
      preserveAspectRatio='none'
      className={cn(
        'h-9 w-24 shrink-0',
        positive ? 'text-emerald-500' : 'text-destructive',
      )}
      aria-hidden='true'
    >
      <path
        d={path}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function WatchlistCard({
  coin,
  onNavigate,
}: {
  coin: CoinsList
  onNavigate: () => void
}) {
  const { format } = useCurrency()

  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      onClick={onNavigate}
      className='flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border bg-linear-to-br from-card to-background p-3 transition-colors hover:border-primary/45'
    >
      <div className='flex w-full min-w-0 items-center gap-2'>
        <img src={coin.image} alt='' className='size-8 shrink-0 rounded-full' />
        <div className='flex min-w-0 items-center gap-1'>
          <p className='min-w-0 truncate text-base font-semibold'>
            {coin.name}
          </p>
          <Badge
            variant='secondary'
            className='h-4 px-1.5 text-[9px] uppercase'
          >
            {coin.symbol}
          </Badge>
        </div>
      </div>
      <div className='mt-2 flex w-full items-center gap-2'>
        <p className='text-sm font-bold tabular-nums'>
          {format(coin.current_price, { maximumFractionDigits: 6 })}
        </p>
        <PriceChange value={coin.price_change_percentage_24h} />
      </div>
      <div className='mt-1 w-full overflow-hidden'>
        <CoinSparkline coin={coin} />
      </div>
    </Link>
  )
}

function TrendingCard({
  coin,
  onNavigate,
}: {
  coin: CoinsList
  onNavigate: () => void
}) {
  const { format } = useCurrency()

  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      onClick={onNavigate}
      className='group w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-linear-to-br from-card to-background p-3 text-xs transition-colors hover:border-primary/45'
    >
      <div className='flex min-w-0 items-center gap-3'>
        <img
          src={coin.image}
          alt=''
          loading='lazy'
          className='size-8 shrink-0 rounded-full'
        />
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-1'>
            <p className='truncate text-base font-bold'>{coin.name}</p>
            <Badge variant='secondary' className='uppercase text-xs'>
              {coin.symbol}
            </Badge>
          </div>
          {coin.market_cap_rank != null && (
            <span className='mt-0.5 block text-xs text-muted-foreground tabular-nums'>
              #{coin.market_cap_rank}
            </span>
          )}
        </div>
        <div className='min-w-0 max-w-[42%] shrink text-right'>
          <p className='truncate text-sm font-bold tabular-nums'>
            {format(coin.current_price, { maximumFractionDigits: 6 })}
          </p>
          <div className='mt-0.5'>
            <PriceChange value={coin.price_change_percentage_24h} />
          </div>
        </div>
      </div>

      <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Market cap</p>
          <p className='truncate font-medium tabular-nums'>
            {format(coin.market_cap, { notation: 'compact' })}
          </p>
        </div>
        <div className='min-w-0 text-right'>
          <p className='text-muted-foreground'>Volume 24H</p>
          <p className='truncate font-medium tabular-nums'>
            {format(coin.total_volume, { notation: 'compact' })}
          </p>
        </div>
      </div>
    </Link>
  )
}

function SearchResultCard({
  coin,
  onNavigate,
}: {
  coin: SearchCoin
  onNavigate: (coin: SearchCoin) => void
}) {
  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      onClick={() => onNavigate(coin)}
      className='group flex min-w-0 items-center gap-3 rounded-md border border-border/60 bg-background/30 p-2.5 transition-colors hover:border-primary/40 hover:bg-accent/20'
    >
      <img src={coin.thumb} alt='' className='size-10 shrink-0 rounded-full' />
      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 items-center gap-2'>
          <p className='truncate text-base font-semibold'>{coin.name}</p>
          <Badge
            variant='secondary'
            className='h-4 px-1.5 text-[10px] uppercase'
          >
            {coin.symbol}
          </Badge>
        </div>
        <span className='mt-1 block text-sm font-semibold text-muted-foreground tabular-nums'>
          {coin.market_cap_rank ? `#${coin.market_cap_rank}` : '—'}
        </span>
      </div>
      <ArrowRight className='size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
    </Link>
  )
}

export function SearchDialog({
  children,
  onNavigate,
  shortcut = false,
}: {
  children: ReactNode
  onNavigate?: () => void
  shortcut?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 350)
  const { currency } = useCurrency()
  const { data: results, isFetching, isError } = useCoinSearch(debouncedQuery)
  const { data: trending, isLoading: isTrendingLoading } = useTrending({
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
  const watchlist = useWatchlistStore((state) => state.coins)
  const recentCoins = useRecentSearchesStore((state) => state.coins)
  const addRecentCoin = useRecentSearchesStore((state) => state.addCoin)
  const addRecentCategory = useRecentSearchesStore((state) => state.addCategory)
  const clearRecentCoins = useRecentSearchesStore((state) => state.clearCoins)

  const trendingIds = useMemo(
    () => trending?.coins.map(({ item }) => item.id).join(',') ?? '',
    [trending],
  )
  const { data: trendingMarkets, isFetching: isTrendingMarketsLoading } =
    useCoins(
      1,
      Math.max(trending?.coins.length ?? 1, 1),
      undefined,
      currency,
      open && trendingIds.length > 0,
      30000,
      false,
      300000,
      trendingIds || undefined,
      false,
    )
  const trendingById = useMemo(
    () => new Map(trendingMarkets?.map((coin) => [coin.id, coin]) ?? []),
    [trendingMarkets],
  )
  const orderedTrending = useMemo(
    () =>
      trending?.coins
        .map(({ item }) => trendingById.get(item.id))
        .filter((coin): coin is CoinsList => Boolean(coin)) ?? [],
    [trending, trendingById],
  )
  const watchlistIds = useMemo(
    () => watchlist.map((coin) => coin.id).join(','),
    [watchlist],
  )
  const { data: freshWatchlist, isFetching: isWatchlistLoading } = useCoins(
    1,
    Math.max(watchlist.length, 1),
    undefined,
    currency,
    open && watchlistIds.length > 0,
    1000 * 60 * 10,
    false,
    300000,
    watchlistIds || undefined,
    false,
  )
  const watchlistCards = freshWatchlist ?? watchlist

  const hasQuery = query.trim().length > 0
  const isWaitingForDebounce = query.trim() !== debouncedQuery
  const isSearching = isWaitingForDebounce || isFetching

  useEffect(() => {
    if (!shortcut) return

    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTyping
      ) {
        return
      }

      event.preventDefault()
      setQuery('')
      setOpen(true)
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [shortcut])

  const close = () => {
    setQuery('')
    setOpen(false)
    onNavigate?.()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setQuery('')
    setOpen(nextOpen)
  }

  const handleSubmit = (event: FormEvent) => event.preventDefault()

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && query) {
      event.preventDefault()
      setQuery('')
    }
  }

  const handleCoinNavigate = (coin: SearchCoin) => {
    addRecentCoin({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.thumb,
    })
    close()
  }

  const handleCategoryNavigate = (category: SearchCategory) => {
    addRecentCategory({
      id: category.id,
      name: category.name,
      type: 'category',
    })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className='grid h-[min(720px,calc(100dvh-2rem))] w-[calc(100vw-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-xl bg-card p-4 sm:max-w-4xl'
      >
        <DialogHeader>
          <DialogTitle className='sr-only'>Search Viridian</DialogTitle>
          <DialogDescription className='sr-only'>
            Search CoinGecko coins and categories
          </DialogDescription>
          <div className='flex items-center gap-2'>
            <form onSubmit={handleSubmit} className='relative min-w-0 flex-1'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder='Search coins or categories...'
                aria-label='Search coins or categories'
                className='h-11 rounded-md bg-background/50 pl-9 pr-24'
              />
              {query && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setQuery('')}
                  aria-label='Clear search'
                  className='absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 text-xs text-muted-foreground'
                >
                  <Eraser className='size-4' />
                  Clear
                </Button>
              )}
            </form>
            <DialogClose asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Close search'
                className='size-10 shrink-0 rounded-md border border-border/60 bg-background/40'
              >
                <X className='size-5!' />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div
          className={cn(
            'no-scrollbar min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain',
            !hasQuery && 'lg:overflow-hidden',
          )}
        >
          {hasQuery ? (
            isSearching ? (
              <ResultSkeletons />
            ) : isError ? (
              <div className='flex h-full min-h-44 flex-col items-center justify-center text-center'>
                <FolderSearch className='mb-3 size-8 text-muted-foreground' />
                <p className='font-semibold'>Search is unavailable</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Please try again in a moment.
                </p>
              </div>
            ) : (results?.coins.length ?? 0) === 0 &&
              (results?.categories.length ?? 0) === 0 ? (
              <div className='flex h-full min-h-44 flex-col items-center justify-center text-center'>
                <FolderSearch className='mb-3 size-8 text-muted-foreground' />
                <p className='font-semibold'>Nothing found</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Try a coin name, ticker, or category.
                </p>
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                {(results?.categories.length ?? 0) > 0 && (
                  <section className='order-2'>
                    <div className='mb-3 flex items-center gap-2'>
                      <FolderSearch className='size-5 text-foreground' />
                      <h2 className='text-base font-semibold'>Categories</h2>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {results?.categories.map((category) => (
                        <Link
                          key={category.id}
                          to='/'
                          search={{ category: category.id, page: 1 }}
                          onClick={() => handleCategoryNavigate(category)}
                          className='rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent'
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {(results?.coins.length ?? 0) > 0 && (
                  <section className='order-1'>
                    <div className='mb-3 flex items-center gap-2'>
                      <CircleDollarSign className='size-5 text-foreground' />
                      <h2 className='text-base font-semibold'>Coins</h2>
                    </div>
                    <div className='grid gap-2 sm:grid-cols-2'>
                      {results?.coins.map((coin) => (
                        <SearchResultCard
                          key={coin.id}
                          coin={coin}
                          onNavigate={handleCoinNavigate}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )
          ) : (
            <div className='grid min-h-0 w-full min-w-0 max-w-full gap-5 overflow-x-hidden lg:h-full lg:grid-cols-[1.15fr_0.85fr] lg:gap-0'>
              <div className='flex min-h-0 w-full min-w-0 max-w-full flex-col gap-4 lg:no-scrollbar lg:overflow-y-auto lg:pr-4'>
                {recentCoins.length > 0 && (
                  <section className='w-full'>
                    <div className='mb-2 flex min-h-8 items-center justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <span className='flex size-5 shrink-0 items-center justify-center'>
                          <Clock3 className='size-4 text-foreground' />
                        </span>
                        <h2 className='text-lg font-semibold'>
                          Recent searches
                        </h2>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={clearRecentCoins}
                        className='rounded-md text-xs text-muted-foreground hover:bg-transparent! hover:text-destructive'
                      >
                        Clear history
                      </Button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {recentCoins.map((coin) => (
                        <div
                          key={`${coin.type ?? 'coin'}-${coin.id}`}
                          className='flex items-center justify-center rounded-full border border-border bg-linear-to-br from-card to-background px-4 py-1.5'
                        >
                          {coin.type === 'category' ? (
                            <Link
                              to='/'
                              search={{ category: coin.id, page: 1 }}
                              onClick={close}
                              className='flex min-w-0 items-center justify-center gap-2'
                            >
                              <FolderSearch className='size-5 shrink-0 text-foreground' />
                              <span className='max-w-44 truncate text-sm font-medium'>
                                {coin.name}
                              </span>
                            </Link>
                          ) : (
                            <Link
                              to='/coins/$coinId'
                              params={{ coinId: coin.id }}
                              onClick={close}
                              className='flex min-w-0 items-center justify-center gap-2'
                            >
                              <img
                                src={coin.image}
                                alt=''
                                className='size-6 shrink-0 rounded-full'
                              />
                              <span className='max-w-44 truncate text-sm font-medium'>
                                {coin.name}
                              </span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className='flex min-h-0 w-full flex-1 flex-col'>
                  <div className='mb-2 flex min-h-8 items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='flex size-5 shrink-0 items-center justify-center'>
                        <Star className='size-4 text-foreground' />
                      </span>
                      <h2 className='text-lg font-semibold'>Watchlist</h2>
                    </div>
                    {watchlist.length > 0 && (
                      <Button
                        asChild
                        variant='ghost'
                        size='sm'
                        className='rounded-md text-xs text-muted-foreground hover:bg-transparent! hover:text-foreground'
                      >
                        <Link to='/watchlist' onClick={close}>
                          Manage watchlist
                        </Link>
                      </Button>
                    )}
                  </div>
                  {watchlist.length > 0 ? (
                    isWatchlistLoading && !freshWatchlist ? (
                      <div className='grid gap-2 sm:grid-cols-2'>
                        {Array.from({
                          length: Math.min(watchlist.length, 4),
                        }).map((_, index) => (
                          <Skeleton key={index} className='h-20 rounded-xl' />
                        ))}
                      </div>
                    ) : (
                      <div className='grid gap-2 sm:grid-cols-2'>
                        {watchlistCards.map((coin) => (
                          <WatchlistCard
                            key={coin.id}
                            coin={coin}
                            onNavigate={close}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className='flex min-h-52 flex-1 flex-col items-center justify-center rounded-xl border border-border/60 bg-background/60 px-4 text-center'>
                      <Star className='mb-3 size-6 text-foreground' />
                      <h3 className='text-base font-semibold'>
                        Start building your watchlist
                      </h3>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        You haven't followed any tokens yet.
                      </p>
                      <Button asChild size='sm' className='mt-3 rounded-md'>
                        <Link to='/watchlist' onClick={close}>
                          Get started
                        </Link>
                      </Button>
                    </div>
                  )}
                </section>
              </div>

              <section className='flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-hidden lg:h-full lg:border-l lg:border-border/70 lg:pl-4'>
                <div className='mb-2 flex min-h-8 shrink-0 items-center gap-2'>
                  <span className='flex size-5 shrink-0 items-center justify-center'>
                    <TrendingUp className='size-4 text-foreground' />
                  </span>
                  <h2 className='text-lg font-semibold'>Trending coins</h2>
                </div>
                <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
                  {isTrendingLoading ||
                  isTrendingMarketsLoading ||
                  orderedTrending.length === 0 ? (
                    <TrendingSkeletons />
                  ) : (
                    <div className='grid gap-2'>
                      {orderedTrending.map((coin) => (
                        <TrendingCard
                          key={coin.id}
                          coin={coin}
                          onNavigate={close}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
