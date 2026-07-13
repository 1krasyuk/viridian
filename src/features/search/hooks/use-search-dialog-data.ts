import { useMemo } from 'react'

import { useCurrency } from '@/features/currency/hooks'
import {
  useCoins,
  useCoinSearch,
  useTrending,
} from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import { useWatchlistStore } from '@/features/watchlist/store/watchlist-store'

import { useDebouncedValue } from './use-debounced-value'

export function useSearchDialogData(query: string, open: boolean) {
  const debouncedQuery = useDebouncedValue(query.trim(), 350)
  const { currency } = useCurrency()
  const searchQuery = useCoinSearch(debouncedQuery)
  const trendingQuery = useTrending({
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
  const watchlist = useWatchlistStore((state) => state.coins)

  const trendingIds = useMemo(
    () => trendingQuery.data?.coins.map(({ item }) => item.id).join(',') ?? '',
    [trendingQuery.data],
  )
  const trendingMarketsQuery = useCoins(
    1,
    Math.max(trendingQuery.data?.coins.length ?? 1, 1),
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
    () =>
      new Map(trendingMarketsQuery.data?.map((coin) => [coin.id, coin]) ?? []),
    [trendingMarketsQuery.data],
  )
  const trendingCoins = useMemo(
    () =>
      trendingQuery.data?.coins
        .map(({ item }) => trendingById.get(item.id))
        .filter((coin): coin is CoinsList => Boolean(coin)) ?? [],
    [trendingById, trendingQuery.data],
  )

  const watchlistIds = useMemo(
    () => watchlist.map((coin) => coin.id).join(','),
    [watchlist],
  )
  const watchlistQuery = useCoins(
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

  return {
    results: searchQuery.data,
    isSearchError: searchQuery.isError,
    isSearching: query.trim() !== debouncedQuery || searchQuery.isFetching,
    watchlist,
    watchlistCoins: watchlistQuery.data ?? watchlist,
    isWatchlistLoading: watchlistQuery.isFetching && !watchlistQuery.data,
    trendingCoins,
    isTrendingLoading:
      trendingQuery.isLoading ||
      trendingMarketsQuery.isFetching ||
      trendingCoins.length === 0,
  }
}
