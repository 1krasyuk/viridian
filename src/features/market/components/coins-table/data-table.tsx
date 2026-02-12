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
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: loading ? skeletonRows : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className='space-y-4 w-full'>
      <div className='w-full text-right overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='bg-sidebar text-right'
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
                  className='group duration-0'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {loading ? (
                        <Skeleton className='h-4 w-full' />
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
                  className='h-24 text-center'
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
