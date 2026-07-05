import { createFileRoute } from '@tanstack/react-router'
import { WatchlistEmpty } from '@/features/watchlist/components/watchlist-empty'
import { useWatchlistStore } from '@/features/watchlist/store/watchlist-store'
import { WatchlistPage } from '@/features/watchlist/components/watchlist-page'

export const Route = createFileRoute('/watchlist')({
  component: RouteComponent,
})

function RouteComponent() {
  const coins = useWatchlistStore((state) => state.coins)

  if (coins.length === 0) {
    return <WatchlistEmpty />
  }

  return (
    <div className=' py-2 sm:py-4 max-w-[100vw]'>
      <WatchlistPage />
    </div>
  )
}
