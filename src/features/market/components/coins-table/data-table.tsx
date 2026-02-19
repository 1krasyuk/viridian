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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  X,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'

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
  // loadingCategories,
}: DataTableProps<TData, TValue>) {
  const skeletonRows = Array.from({ length: perPage }).map((_, i) => ({
    id: `skeleton-${i}`,
  })) as TData[]

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(deafaultVisibilityState)

  const categoryValue = categories?.find((c) => c.category_id === category)

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
      <div className='flex justify-between mx-3 mt-3'>
        <Combobox
          items={categories || []}
          itemToStringValue={(category: Category) => category.name}
          itemToStringLabel={(category: Category) => category.name}
          value={categoryValue}
          onValueChange={(category) => {
            onCategoryChange(category?.category_id)
          }}
        >
          <ComboboxInput
            placeholder='Select a category'
            className='w-50 rounded-lg'
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No category found.</ComboboxEmpty>
            <ComboboxList>
              {(category) => (
                <ComboboxItem key={category.category_id} value={category}>
                  {category.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <div className='flex gap-5 items-center'>
          <Dialog>
            <DialogTrigger>
              <Button variant='outline' className=''>
                Columns
                <Settings2 />
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-card sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  Choose up to
                  <Badge
                    className='px-2 mx-2 rounded-md text-sm font-bold'
                    variant={
                      table.getVisibleLeafColumns().length < 15
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {table.getVisibleLeafColumns().length}/15
                  </Badge>
                  metrics
                </DialogTitle>
                <DialogDescription>
                  Add, delete and sort metrics just how you need it
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-5'>
                {Object.entries(
                  table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .reduce<
                      Record<string, ReturnType<typeof table.getAllLeafColumns>>
                    >((groups, column) => {
                      const category =
                        (
                          column.columnDef.meta as {
                            category?: string
                          }
                        )?.category ?? 'Other'
                      if (!groups[category]) groups[category] = []
                      groups[category].push(column)
                      return groups
                    }, {}),
                ).map(([category, cols]) => (
                  <div key={category} className='flex items-start'>
                    <span className='text-sm text-muted-foreground w-28 shrink-0 pt-1.5 '>
                      {category}
                    </span>
                    <div className='flex flex-wrap gap-1.5 w-full justify-end'>
                      {cols.map((column) => (
                        <Button
                          key={column.id}
                          variant={column.getIsVisible() ? 'soft' : 'outline'}
                          disabled={
                            !column.getIsVisible() &&
                            table.getVisibleLeafColumns().length >= 15
                          }
                          size='sm'
                          className='rounded-3xl gap-1.5 font-bold'
                          onClick={() => column.toggleVisibility()}
                        >
                          {(
                            column.columnDef.meta as {
                              label?: string
                            }
                          )?.label ?? column.id}
                          {column.getIsVisible() && (
                            <X className='rounded-full bg-primary text-primary-foreground size-4 p-0.5' />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='w-30'>
                {perPage} Rows
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='min-w-0 p-1'>
              <DropdownMenuRadioGroup
                value={String(perPage)}
                onValueChange={(value) => {
                  onPageChange(1, Number(value))
                }}
              >
                {[20, 50, 100, 200, 250].map((size) => (
                  <DropdownMenuRadioItem
                    key={size}
                    value={String(size)}
                    className='my-0.5'
                  >
                    {size} Rows
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
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
