import { Link } from '@tanstack/react-router'
import { Clock3, FolderSearch } from 'lucide-react'

import { Button } from '@/shared/ui/button'

import { useRecentSearchesStore } from '../store/recent-searches-store'

export function SearchRecents({ onNavigate }: { onNavigate: () => void }) {
  const items = useRecentSearchesStore((state) => state.coins)
  const clearItems = useRecentSearchesStore((state) => state.clearCoins)

  if (items.length === 0) return null

  return (
    <section className='w-full'>
      <div className='mb-2 flex min-h-8 items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <span className='flex size-5 shrink-0 items-center justify-center'>
            <Clock3 className='size-4 text-foreground' />
          </span>
          <h2 className='text-lg font-semibold'>Recent searches</h2>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={clearItems}
          className='rounded-md text-xs text-muted-foreground hover:bg-transparent! hover:text-destructive'
        >
          Clear history
        </Button>
      </div>
      <div className='flex flex-wrap gap-2'>
        {items.map((item) => (
          <div
            key={`${item.type ?? 'coin'}-${item.id}`}
            className='flex items-center justify-center rounded-full border border-border bg-linear-to-br from-card to-background px-4 py-1.5'
          >
            {item.type === 'category' ? (
              <Link
                to='/'
                search={{ category: item.id, page: 1 }}
                onClick={onNavigate}
                className='flex min-w-0 items-center justify-center gap-2'
              >
                <FolderSearch className='size-5 shrink-0 text-foreground' />
                <span className='max-w-44 truncate text-sm font-medium'>
                  {item.name}
                </span>
              </Link>
            ) : (
              <Link
                to='/coins/$coinId'
                params={{ coinId: item.id }}
                onClick={onNavigate}
                className='flex min-w-0 items-center justify-center gap-2'
              >
                <img
                  src={item.image}
                  alt=''
                  className='size-6 shrink-0 rounded-full'
                />
                <span className='max-w-44 truncate text-sm font-medium'>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
