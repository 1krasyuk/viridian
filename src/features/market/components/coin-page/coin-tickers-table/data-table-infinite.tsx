// data-table-infinite.tsx
import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface DataTableInfiniteProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  onResetFilters?: () => void
  hasActiveFilters?: boolean
  pageSize?: number
}

export function DataTableInfinite<TData, TValue>({
  columns,
  data,
  loading,
  onResetFilters,
  hasActiveFilters,
  pageSize = 20,
}: DataTableInfiniteProps<TData, TValue>) {
  const [visibleCount, setVisibleCount] = React.useState(pageSize)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  const visibleData = React.useMemo(
    () => data.slice(0, visibleCount),
    [data, visibleCount],
  )
  const hasMore = visibleCount < data.length

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: visibleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const loadMore = React.useCallback(() => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + pageSize, data.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, hasMore, pageSize, data.length])

  const observerRef = React.useRef<IntersectionObserver | null>(null)

  const lastRowRef = React.useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading || isLoadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, isLoadingMore, hasMore, loadMore],
  )

  const hasNoResults = !loading && data.length === 0

  return (
    <div className='rounded-md border relative'>
      <div className='overflow-x-auto custom-scrollbar'>
        <Table className='min-w-230'>
          <TableHeader className='bg-popover z-10 sticky top-0'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='text-right font-medium text-muted-foreground whitespace-nowrap'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                ref={
                  index === table.getRowModel().rows.length - 1
                    ? lastRowRef
                    : null
                }
                className='group hover:bg-muted/50'
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className='whitespace-nowrap text-right'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {isLoadingMore &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col, colIndex) => {
                    const widthMap: Record<string, string> = {
                      index: 'w-8',
                      exchange: 'w-40',
                      type: 'w-12',
                      pair: 'w-28',
                      price: 'w-20',
                      spread: 'w-16',
                      volume: 'w-16',
                      volume_percentage: 'w-12',
                      last_updated: 'w-24',
                    }

                    const alignMap: Record<string, string> = {
                      exchange: 'text-left',
                      pair: 'text-left',
                    }

                    const skeletonWidth = widthMap[col.id as string] || 'w-20'
                    const align = alignMap[col.id as string] || 'text-right'
                    const margin =
                      col.id === 'exchange' || col.id === 'pair'
                        ? 'mr-auto'
                        : 'ml-auto'

                    return (
                      <TableCell
                        key={`skeleton-col-${colIndex}`}
                        className={cn('whitespace-nowrap', align)}
                      >
                        <Skeleton
                          className={cn('h-3 ', skeletonWidth, margin)}
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}

            {hasNoResults && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-64 text-center'
                >
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <p className='text-muted-foreground'>
                      {hasActiveFilters
                        ? 'No results match your filters.'
                        : 'No results found.'}
                    </p>
                    {hasActiveFilters && onResetFilters && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={onResetFilters}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
