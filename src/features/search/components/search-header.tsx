import type { FormEvent, KeyboardEvent } from 'react'
import { Eraser, Search, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

export function SearchHeader({
  query,
  onQueryChange,
  title = 'Search Viridian',
  description = 'Search CoinGecko coins and categories',
  placeholder = 'Search coins or categories...',
}: {
  query: string
  onQueryChange: (query: string) => void
  title?: string
  description?: string
  placeholder?: string
}) {
  const handleSubmit = (event: FormEvent) => event.preventDefault()
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && query) {
      event.preventDefault()
      onQueryChange('')
    }
  }

  return (
    <DialogHeader>
      <DialogTitle className='sr-only'>{title}</DialogTitle>
      <DialogDescription className='sr-only'>{description}</DialogDescription>
      <div className='flex items-center gap-2'>
        <form onSubmit={handleSubmit} className='relative min-w-0 flex-1'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            className='h-11 rounded-md bg-background/50 pl-9 pr-24'
          />
          {query && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onQueryChange('')}
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
  )
}
