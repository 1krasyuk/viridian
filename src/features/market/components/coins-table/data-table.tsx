import * as React from 'react'

import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

import type { Category } from '../../types/categories'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

import { DataTableToolbar } from './data-table-toolbar'
import { DataTablePagination } from './data-table-pagination'

const PINNED_COLUMNS: Record<
  string,
  { left: number; width?: number; minWidth?: number; isLast?: boolean }
> = {
  market_cap_rank: { left: 0, width: 60 },
  name: { left: 60, minWidth: 120, isLast: true },
}

const MIN_COL_WIDTH = 120

const defaultVisibilityState = {
  market_cap_rank: true,
  name: true,
  current_price: true,
  price_change_24h: false,
  price_change_percentage_1h_in_currency: false,
  price_change_percentage_24h: true,
  price_change_percentage_7d_in_currency: true,
  price_change_percentage_30d_in_currency: true,
  price_change_percentage_1y_in_currency: false,
  market_cap: true,
  total_volume: true,
  circulating_supply: true,
  high_24h: false,
  low_24h: false,

  //OPTIONAL
  market_cap_change_24h: false,
  market_cap_change_percentage_24h: false,
  total_supply: false,
  max_supply: false,
  ath: false,
  ath_change_percentage: false,
  ath_date: false,
  atl: false,
  atl_change_percentage: false,
  atl_date: false,
  roi: false,
  last_updated: false,
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  page: number
  perPage: number
  pageCount: number
  onPageChange: (page: number, size?: number) => void
  categories?: Category[]
  loadingCategories?: boolean
  category: string | undefined
  onCategoryChange: (category: string | undefined) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  page,
  perPage,
  pageCount,
  onPageChange,
  categories,
  category,
  onCategoryChange,
}: DataTableProps<TData, TValue>) {
  const skeletonRows = Array.from({ length: perPage }).map((_, i) => ({
    id: `skeleton-${i}`,
  })) as TData[]

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultVisibilityState)

  const categoryValue = categories?.find((c) => c.category_id === category)

  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    columns.map((c) => c.id as string),
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: loading ? skeletonRows : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
  })

  const handleResetColumns = () => {
    setColumnVisibility(defaultVisibilityState)
    setColumnOrder(columns.map((c) => c.id as string))
  }

  const handleReset = () => {
    handleResetColumns()
    setSorting([])
    onPageChange(1, 100)
    onCategoryChange(undefined)
  }

  // Split-table: refs for scroll sync and column width measurement
  const headerScrollRef = React.useRef<HTMLDivElement>(null)
  const bodyScrollRef = React.useRef<HTMLDivElement>(null)
  const bodyTableRef = React.useRef<HTMLTableElement>(null)
  const [colWidths, setColWidths] = React.useState<number[]>([])
  const [totalWidth, setTotalWidth] = React.useState(0)

  const handleBodyScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft
    }
  }

  // Measure body column widths and apply to header table
  const measureColWidths = React.useCallback(() => {
    const bodyTable = bodyTableRef.current
    if (!bodyTable) return
    const firstRow = bodyTable.querySelector('tbody tr')
    if (!firstRow) return
    const cells = Array.from(firstRow.querySelectorAll('td'))
    const widths = cells.map((cell) => cell.getBoundingClientRect().width)
    setTotalWidth(bodyTable.scrollWidth)
    setColWidths(widths)
  }, [])

  React.useLayoutEffect(() => {
    if (loading) return
    measureColWidths()
  }, [loading, data, columnVisibility, columnOrder, measureColWidths])

  // Re-measure on container resize (window resize, sidebar toggle, etc.)
  React.useEffect(() => {
    const container = bodyScrollRef.current
    if (!container) return
    const observer = new ResizeObserver(measureColWidths)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measureColWidths])

  return (
    <div className='w-full'>
      <DataTableToolbar
        table={table}
        categories={categories}
        categoryValue={categoryValue}
        onCategoryChange={onCategoryChange}
        perPage={perPage}
        onPageChange={onPageChange}
        onReset={handleReset}
        onResetColumns={handleResetColumns}
      />
      {/* Sticky table header — separate table synced with body */}
      <div
        ref={headerScrollRef}
        className='sticky top-0 z-20 overflow-hidden text-right '
      >
        <table
          className='w-full text-sm'
          style={
            colWidths.length > 0
              ? { tableLayout: 'fixed', width: totalWidth }
              : undefined
          }
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const pinned = PINNED_COLUMNS[header.column.id]
                  const measuredWidth = colWidths[headerIndex]
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'bg-sidebar text-right group-hover:bg-muted/80',
                        pinned && 'sticky z-10',
                        pinned?.isLast && '',
                      )}
                      style={{
                        ...(measuredWidth != null && {
                          width: measuredWidth,
                        }),
                        ...(pinned && { left: pinned.left }),
                      }}
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
        </table>
      </div>

      {/* Scrollable table body — horizontal scroll synced to header */}
      <div
        ref={bodyScrollRef}
        className='overflow-x-auto text-right custom-scrollbar'
        onScroll={handleBodyScroll}
      >
        <table ref={bodyTableRef} className='w-full text-sm'>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group duration-0'
                >
                  {row.getVisibleCells().map((cell) => {
                    const pinned = PINNED_COLUMNS[cell.column.id]
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          pinned && 'sticky z-10 bg-background',
                          pinned?.isLast && '',
                          // 'shadow-[inset_-1px_0_0_0_var(--color-border)]',
                        )}
                        style={
                          pinned
                            ? {
                                left: pinned.left,
                                ...(pinned.width && {
                                  width: pinned.width,
                                  minWidth: pinned.width,
                                  maxWidth: pinned.width,
                                }),
                                ...(pinned.minWidth && {
                                  minWidth: pinned.minWidth,
                                }),
                              }
                            : { minWidth: MIN_COL_WIDTH }
                        }
                      >
                        {loading ? (
                          <Skeleton className='h-4 w-full' />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-64 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
      <DataTablePagination
        page={page}
        perPage={perPage}
        pageCount={pageCount}
        loading={loading}
        onPageChange={onPageChange}
      />
    </div>
  )
}
