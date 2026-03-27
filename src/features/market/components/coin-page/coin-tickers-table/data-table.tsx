import * as React from 'react'

import type { ColumnDef } from '@tanstack/react-table'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  type PaginationState,
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
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pagination,
  onPaginationChange,
  onResetFilters,
  hasActiveFilters,
}: DataTableProps<TData, TValue>) {
  const skeletonRows = Array.from({ length: pagination.pageSize }).map(
    (_, i) => ({
      id: `skeleton-${i}`,
    }),
  ) as TData[]

  const [sorting, setSorting] = React.useState<SortingState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: loading ? skeletonRows : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater
      onPaginationChange(newPagination)
    },
    state: {
      sorting,
      pagination,
    },
    manualPagination: false,
  })

  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex + 1
  const totalRows = data.length
  const startRow = Math.min(
    currentPage * pagination.pageSize - pagination.pageSize + 1,
    totalRows,
  )
  const endRow = Math.min(currentPage * pagination.pageSize, totalRows)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(pageCount)
      } else if (currentPage >= pageCount - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = pageCount - 3; i <= pageCount; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(pageCount)
      }
    }

    return pages
  }

  return (
    <div className='w-full space-y-4'>
      {/* Table */}
      <div className='rounded-md border overflow-hidden'>
        <div className='overflow-x-auto custom-scrollbar'>
          <Table>
            <TableHeader className='bg-muted/50 '>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                  {headerGroup.headers.map((header) => {
                    return (
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
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group hover:bg-muted/50'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className='whitespace-nowrap text-right'
                      >
                        {loading ? (
                          <Skeleton className='h-4 w-20' />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
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
                          className='gap-1'
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

      {/* Pagination */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-2 flex-wrap'>
        {/* Showing text */}
        <div className='text-sm text-muted-foreground whitespace-nowrap order-2 sm:order-1'>
          Showing {startRow} to {endRow} of {totalRows} results
        </div>

        {/* Page buttons */}
        <div className='flex items-center gap-1 order-1 sm:order-2 '>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className='px-2 text-muted-foreground'
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size='sm'
                className={cn(
                  'h-8 w-8 p-0 text-sm',
                  currentPage === page && 'bg-primary text-primary-foreground',
                )}
                onClick={() => table.setPageIndex((page as number) - 1)}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>

        {/* Rows per page selector */}
        <div className='flex items-center gap-2 order-3'>
          <span className='text-sm text-muted-foreground'>Rows</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              onPaginationChange({
                pageIndex: 0,
                pageSize: Number(value),
              })
            }}
          >
            <SelectTrigger className='rounded-lg px-2'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='max-w-1'>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
