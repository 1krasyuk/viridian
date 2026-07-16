import { type ReactNode, useCallback, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'

import { useSearchShortcut } from '../hooks/use-search-shortcut'
import { SearchHeader } from './search-header'
import { SearchRenderer } from './search-renderer'

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
  const hasQuery = query.trim().length > 0

  const openFromShortcut = useCallback(() => {
    setQuery('')
    setOpen(true)
  }, [])
  useSearchShortcut(shortcut, openFromShortcut)

  const close = () => {
    setQuery('')
    setOpen(false)
    onNavigate?.()
  }
  const handleOpenChange = (nextOpen: boolean) => {
    setQuery('')
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className='grid h-[min(720px,calc(100dvh-2rem))] w-[calc(100vw-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-xl bg-card p-4 sm:max-w-4xl'
      >
        <SearchHeader query={query} onQueryChange={setQuery} />
        <div
          className={cn(
            'no-scrollbar min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain',
            !hasQuery && 'lg:overflow-hidden',
          )}
        >
          <SearchRenderer query={query} open={open} onNavigate={close} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
