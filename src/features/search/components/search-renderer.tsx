import { FolderSearch } from 'lucide-react'

import { useSearchDialogData } from '../hooks/use-search-dialog-data'
import { SearchRecents } from './search-recents'
import { SearchResults, SearchResultsSkeleton } from './search-results'
import { SearchTrendings } from './search-trendings'
import { SearchWatchlist } from './search-watchlist'

function SearchMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className='flex h-full min-h-44 flex-col items-center justify-center text-center'>
      <FolderSearch className='mb-3 size-8 text-muted-foreground' />
      <p className='font-semibold'>{title}</p>
      <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
    </div>
  )
}

export function SearchRenderer({
  query,
  open,
  onNavigate,
}: {
  query: string
  open: boolean
  onNavigate: () => void
}) {
  const data = useSearchDialogData(query, open)
  const hasQuery = query.trim().length > 0

  if (!hasQuery) {
    return (
      <div className='grid min-h-0 w-full min-w-0 max-w-full gap-5 overflow-x-hidden lg:h-full lg:grid-cols-[1.15fr_0.85fr] lg:gap-0'>
        <div className='flex min-h-0 w-full min-w-0 max-w-full flex-col gap-4 lg:no-scrollbar lg:overflow-y-auto lg:pr-4'>
          <SearchRecents onNavigate={onNavigate} />
          <SearchWatchlist
            watchlist={data.watchlist}
            coins={data.watchlistCoins}
            isLoading={data.isWatchlistLoading}
            onNavigate={onNavigate}
          />
        </div>
        <SearchTrendings
          coins={data.trendingCoins}
          isLoading={data.isTrendingLoading}
          onNavigate={onNavigate}
        />
      </div>
    )
  }

  if (data.isSearching) return <SearchResultsSkeleton />

  if (data.isSearchError) {
    return (
      <SearchMessage
        title='Search is unavailable'
        description='Please try again in a moment.'
      />
    )
  }

  if (
    !data.results ||
    (data.results.coins.length === 0 && data.results.categories.length === 0)
  ) {
    return (
      <SearchMessage
        title='Nothing found'
        description='Try a coin name, ticker, or category.'
      />
    )
  }

  return <SearchResults results={data.results} onNavigate={onNavigate} />
}
