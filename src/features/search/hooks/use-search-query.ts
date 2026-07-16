import { useCoinSearch } from '@/features/market/hooks/coins-queries'

import { useDebouncedValue } from './use-debounced-value'

export function useSearchQuery(query: string, enabled = true) {
  const normalizedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(normalizedQuery, 350)
  const searchQuery = useCoinSearch(enabled ? debouncedQuery : '')

  return {
    data: searchQuery.data,
    isError: searchQuery.isError,
    isSearching:
      enabled &&
      normalizedQuery.length > 0 &&
      (normalizedQuery !== debouncedQuery || searchQuery.isFetching),
  }
}
