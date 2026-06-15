import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Search, Star } from 'lucide-react'

import { WatchlistTable } from '@/features/watchlist/components/watchlist-table'
import { useWatchlistStore } from '@/features/watchlist/store/watchlist-store'
import { Button } from '@/shared/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

export const Route = createFileRoute('/watchlist')({
  component: RouteComponent,
})

function RouteComponent() {
  const coins = useWatchlistStore((state) => state.coins)

  if (coins.length === 0) {
    return (
      <div className='flex min-h-[calc(100vh-8rem)] items-center justify-center px-4'>
        <Empty className='max-w-xl border bg-card/30'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Star className='fill-current' />
            </EmptyMedia>
            <EmptyTitle>No coins in your watchlist</EmptyTitle>
            <EmptyDescription>
              Track coins from their detail pages and keep the market table
              focused on the assets you care about.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant='secondary'>
              <Link to='/'>
                <Search />
                Explore coins
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return <WatchlistTable />
}
