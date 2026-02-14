import * as React from 'react'

import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const deafaultVisibilityState = {
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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  page,
  perPage,
  pageCount,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const skeletonRows = Array.from({ length: perPage }).map((_, i) => ({
    id: `skeleton-${i}`,
  })) as TData[]

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(deafaultVisibilityState)

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
    },
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <div className='space-y-4 w-full'>
      <Dialog>
        <DialogTrigger>
          <Button variant='outline'>Columns</Button>
        </DialogTrigger>
        <DialogContent className='bg-card'>
          <DialogHeader>
            <DialogTitle>
              Choose up to {table.getVisibleLeafColumns().length}/15 metrics
            </DialogTitle>
            <DialogDescription>
              Add, delete and sort metrics just how you need it
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-wrap  gap-1.5'>
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <Button
                  key={column.id}
                  variant={column.getIsVisible() ? 'soft' : 'outline'}
                  size='sm'
                  className='rounded-3xl gap-1.5  font-bold '
                  onClick={() => column.toggleVisibility()}
                >
                  {(column.columnDef.meta as { label?: string })?.label ??
                    column.id}
                  {column.getIsVisible() && (
                    <X className='rounded-full bg-primary text-primary-foreground size-4 p-0.5' />
                  )}
                </Button>
              ))}
          </div>
          <div className='flex justify-between items-center'>
            <Button
              variant='destructive'
              onClick={() => setColumnVisibility(deafaultVisibilityState)}
            >
              Reset
            </Button>
            <DialogClose asChild>
              <Button>Apply changes</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      <div className='w-full text-right overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='bg-sidebar text-right d'
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
                  className='group duration-0 '
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {loading ? (
                        <Skeleton className='h-4 w-full ' />
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
                  className='h-screen text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center flex-col '>
        <div className='flex gap-2 justify-center '>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page - 1, perPage)}
            disabled={page <= 1 || loading}
            className='min-w-25'
          >
            <ChevronLeft />
            <span>Coins</span>
            {page > 1 ? (
              <>
                {(page - 2) * perPage + 1} - {(page - 1) * perPage}
              </>
            ) : (
              <>
                {(page - 1) * perPage + 1} to {page * perPage}{' '}
              </>
            )}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page + 1, perPage)}
            disabled={page >= pageCount || loading}
            className=' min-w-25'
          >
            <span>Coins</span>
            {page * perPage + 1} - {(page + 1) * perPage}
            <ChevronRight />
          </Button>
        </div>
        <span className='text-sm text-muted-foreground my-3 '>
          Showing {(page - 1) * perPage + 1} to {page * perPage}
        </span>
      </div>
    </div>
  )
}
