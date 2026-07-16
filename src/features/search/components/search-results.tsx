import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CircleDollarSign,
  FolderSearch,
} from 'lucide-react'

import type {
  SearchCoin,
  SearchResponse,
} from '@/features/market/types/search'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'

import { useRecentSearchesStore } from '../store/recent-searches-store'

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
          <Badge variant='secondary' className='h-4 px-1.5 text-[10px] uppercase'>
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

export function SearchResultsSkeleton() {
  return (
    <div className='grid gap-2 sm:grid-cols-2' aria-label='Loading search results'>
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

export function SearchResults({
  results,
  onNavigate,
}: {
  results: SearchResponse
  onNavigate: () => void
}) {
  const addRecentCoin = useRecentSearchesStore((state) => state.addCoin)
  const addRecentCategory = useRecentSearchesStore((state) => state.addCategory)

  return (
    <div className='flex flex-col gap-4'>
      {results.coins.length > 0 && (
        <section className='order-1'>
          <div className='mb-3 flex items-center gap-2'>
            <CircleDollarSign className='size-5 text-foreground' />
            <h2 className='text-base font-semibold'>Coins</h2>
          </div>
          <div className='grid gap-2 sm:grid-cols-2'>
            {results.coins.map((coin) => (
              <SearchResultCard
                key={coin.id}
                coin={coin}
                onNavigate={(selectedCoin) => {
                  addRecentCoin({
                    id: selectedCoin.id,
                    name: selectedCoin.name,
                    symbol: selectedCoin.symbol,
                    image: selectedCoin.thumb,
                  })
                  onNavigate()
                }}
              />
            ))}
          </div>
        </section>
      )}

      {results.categories.length > 0 && (
        <section className='order-2'>
          <div className='mb-3 flex items-center gap-2'>
            <FolderSearch className='size-5 text-foreground' />
            <h2 className='text-base font-semibold'>Categories</h2>
          </div>
          <div className='flex flex-wrap gap-2'>
            {results.categories.map((category) => (
              <Link
                key={category.id}
                to='/'
                search={{ category: category.id, page: 1 }}
                onClick={() => {
                  addRecentCategory({
                    id: category.id,
                    name: category.name,
                    type: 'category',
                  })
                  onNavigate()
                }}
                className='rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent'
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
