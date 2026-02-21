import type { CellContext, Column, ColumnDef } from '@tanstack/react-table'
import type { Coin } from '../../types/coins'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

function sortableHeader<TData, TValue>(
  column: Column<TData, TValue>,
  title: string,
) {
  const isSorted = column.getIsSorted()

  return (
    <Button
      variant='ghost'
      className='px-0 gap-0.5 bg-transparent!'
      onClick={() => column.toggleSorting()}
    >
      {title}

      <div className='flex flex-col'>
        <ChevronUp
          className={cn(
            'transition-colors -mb-2',
            isSorted === 'asc' ? 'text-primary' : 'text-muted-foreground/50',
          )}
        />

        <ChevronDown
          className={cn(
            'transition-colors',
            isSorted === 'desc' ? 'text-primary' : 'text-muted-foreground/50',
          )}
        />
      </div>
    </Button>
  )
}

function formatCurrencyCell<TData extends Coin, TValue>(
  context: CellContext<TData, TValue>,
  options?: {
    maximumFractionDigits?: number
    naText?: string
    showSign?: boolean
    colored?: boolean
  },
) {
  const value = context.getValue() as number | null | undefined
  const {
    maximumFractionDigits = 2,
    naText = '—',
    showSign = false,
    colored = false,
  } = options ?? {}

  let colorClass = ''
  if (colored && value != null) {
    colorClass =
      value > 0
        ? 'dark:text-emerald-400 text-emerald-500'
        : value < 0
          ? 'text-destructive'
          : 'text-muted-foreground'
  }

  if (value == null || isNaN(value)) {
    return <div className='text-muted-foreground'>{naText}</div>
  }

  const prefix = showSign && value > 0 ? '+' : '-'
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: showSign ? 'never' : 'auto',
    maximumFractionDigits,
  }).format(showSign ? Math.abs(value) : value)

  const result = showSign ? `${prefix}${formatted}` : formatted

  if (value === 0 && !colored) {
    return <div className='text-muted-foreground'>{result}</div>
  }

  return (
    <div title={value.toString()} className={colorClass || undefined}>
      {result}
    </div>
  )
}

function formatPercentageChangeCell<TData extends Coin, TValue>(
  context: CellContext<TData, TValue>,
  options?: {
    maximumFractionDigits?: number
    naText?: string
  },
) {
  const value = context.getValue() as number | null | undefined
  const { maximumFractionDigits = 2, naText = '—' } = options ?? {}

  const color =
    value == null
      ? 'text-muted-foreground'
      : value > 0
        ? 'dark:text-emerald-400 text-emerald-500'
        : value < 0
          ? 'text-destructive'
          : 'text-muted-foreground'

  if (value == null) {
    return <div className={color}>{naText}</div>
  }

  const prefix = value > 0 ? '+' : ''
  const formatted = `${prefix}${value.toFixed(maximumFractionDigits)}%`

  return (
    <div title={value.toString()} className={color}>
      {formatted}
    </div>
  )
}

function formatDateCell<TData extends Coin, TValue>(
  context: CellContext<TData, TValue>,
  options?: {
    mode?: 'date' | 'time' | 'datetime'
  },
) {
  const { mode = 'date' } = options ?? {}
  const value = context.getValue() as string | null | undefined

  if (value == null) {
    return <div className='text-muted-foreground'>—</div>
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return <div className='text-muted-foreground'>—</div>
  }

  let formatted: string

  if (mode === 'date') {
    formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } else if (mode === 'time') {
    formatted = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } else {
    formatted = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return <div>{formatted}</div>
}

function formatSparklineCell<TData extends Coin, TValue>(
  context: CellContext<TData, TValue>,
) {
  // Get the { price: number[] } object
  const sparkline = context.getValue() as { price: number[] } | undefined

  // If no data or array is empty
  if (!sparkline?.price?.length)
    return <div className='text-muted-foreground'>—</div>

  const data = sparkline.price
  const width = 150
  const height = 35

  // Find boundaries for scaling
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Function to calculate Y coordinate
  const getY = (val: number) => height - ((val - min) / range) * height

  // Build the path: M (start) x,y L (line) x,y ...
  const pathD = data
    .map(
      (val, i) =>
        `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * width} ${getY(val)}`,
    )
    .join(' ')

  // Color: if the last price is higher than the first - green, otherwise red
  const colorClass =
    data[data.length - 1] >= data[0]
      ? 'stroke-emerald-500 dark:stroke-emerald-400'
      : 'stroke-destructive'

  return (
    <div className='flex items-center justify-end'>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('fill-none stroke-1', colorClass)}
      >
        <path d={pathD} />
      </svg>
    </div>
  )
}

export const columns: ColumnDef<Coin>[] = [
  {
    id: 'market_cap_rank',
    accessorKey: 'market_cap_rank',
    meta: { label: 'Market Cap Rank', category: 'General' },
    header: () => <div className='text-center'>#</div>,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='text-center'>{row.original.market_cap_rank}</div>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <div className='text-left'>{sortableHeader(column, 'Name')}</div>
    ),
    enableHiding: false,
    cell: ({ row }) => {
      const image = row.original.image
      const name = row.original.name
      const symbol = row.original.symbol

      return (
        <div className='flex gap-2.5'>
          <img src={image} className='w-5 h-5 rounded-full scale-115' />
          <p className='truncate max-w-25' title={name}>
            {name}
          </p>
          <Badge
            variant='outline'
            className='group-hover:text-background group-hover:bg-primary duration-75'
          >
            {symbol}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'current_price',
    accessorKey: 'current_price',
    meta: { label: 'Current Price', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'Current Price'),
    cell: (row) => formatCurrencyCell(row),
  },
  {
    id: 'price_change_24h',
    accessorKey: 'price_change_24h',
    meta: { label: '24h Price Change', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '24h Price Change'),
    cell: (row) => formatCurrencyCell(row, { showSign: true, colored: true }),
  },
  {
    id: 'price_change_percentage_1h_in_currency',
    accessorKey: 'price_change_percentage_1h_in_currency',
    meta: { label: '1h %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '1h %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'price_change_percentage_24h',
    accessorKey: 'price_change_percentage_24h',
    meta: { label: '24h %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '24h %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'price_change_percentage_7d_in_currency',
    accessorKey: 'price_change_percentage_7d_in_currency',
    meta: { label: '7d %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '7d %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'price_change_percentage_30d_in_currency',
    accessorKey: 'price_change_percentage_30d_in_currency',
    meta: { label: '30d %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '30d %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'price_change_percentage_1y_in_currency',
    accessorKey: 'price_change_percentage_1y_in_currency',
    meta: { label: '1y %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, '1y %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'market_cap',
    accessorKey: 'market_cap',
    meta: { label: 'Market Cap', category: 'Market' },
    header: ({ column }) => sortableHeader(column, 'Market Cap'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'total_volume',
    accessorKey: 'total_volume',
    meta: { label: 'Total Volume', category: 'Market' },
    header: ({ column }) => sortableHeader(column, 'Total Volume'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'circulating_supply',
    accessorKey: 'circulating_supply',
    meta: { label: 'Circulating Supply', category: 'Supply' },
    header: ({ column }) => sortableHeader(column, 'Circulating Supply'),
    cell: ({ row }) => {
      const supply = row.original.circulating_supply
      const symbol = row.original.symbol.toUpperCase()

      if (supply == null) return <div className='text-muted-foreground'>—</div>

      const tier = Math.floor(Math.log10(supply) / 3)
      const suffixes = ['', 'K', 'M', 'B', 'T']
      const scaled = supply / Math.pow(10, tier * 3)

      const formatted = `${scaled.toFixed(2)}${suffixes[tier] ?? ''} ${symbol}`

      return <div title={supply.toString()}>{formatted}</div>
    },
  },
  {
    id: 'sparkline_in_7d',
    meta: { label: '7d Chart', category: 'Chart' },
    accessorKey: 'sparkline_in_7d',
    header: 'Last 7 days',
    cell: (row) => formatSparklineCell(row),
  },
  {
    id: 'high_24h',
    accessorKey: 'high_24h',
    meta: { label: '24h High', category: 'Price' },
    header: ({ column }) => sortableHeader(column, '24h High'),
    cell: (row) => formatCurrencyCell(row),
  },
  {
    id: 'low_24h',
    accessorKey: 'low_24h',
    meta: { label: '24h Low', category: 'Price' },
    header: ({ column }) => sortableHeader(column, '24h Low'),
    cell: (row) => formatCurrencyCell(row),
  },
  {
    id: 'market_cap_change_24h',
    accessorKey: 'market_cap_change_24h',
    meta: { label: 'Market Cap Change 24h', category: 'Market' },
    header: ({ column }) => sortableHeader(column, '24h Market Cap Change'),
    cell: (row) => formatCurrencyCell(row, { showSign: true, colored: true }),
  },

  {
    id: 'market_cap_change_percentage_24h',
    accessorKey: 'market_cap_change_percentage_24h',
    meta: { label: 'Market Cap Change 24h %', category: 'Market' },
    header: ({ column }) => sortableHeader(column, '24h Market Cap Change %'),
    cell: (row) => formatPercentageChangeCell(row),
  },

  {
    id: 'total_supply',
    accessorKey: 'total_supply',
    meta: { label: 'Total Supply', category: 'Supply' },
    header: ({ column }) => sortableHeader(column, 'Total Supply'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'max_supply',
    accessorKey: 'max_supply',
    meta: { label: 'Max Supply', category: 'Supply' },
    header: ({ column }) => sortableHeader(column, 'Max Supply'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'ath',
    accessorKey: 'ath',
    meta: { label: 'All Time High', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'All Time High'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'ath_change_percentage',
    accessorKey: 'ath_change_percentage',
    meta: { label: 'ATH Change %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, 'ATH Change %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'ath_date',
    accessorKey: 'ath_date',
    meta: { label: 'ATH Date', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'ATH Date'),
    cell: (props) => formatDateCell(props),
  },
  {
    id: 'atl',
    accessorKey: 'atl',
    meta: { label: 'All Time Low', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'All Time Low'),
    cell: (row) => formatCurrencyCell(row, { maximumFractionDigits: 0 }),
  },
  {
    id: 'atl_change_percentage',
    accessorKey: 'atl_change_percentage',
    meta: { label: 'ATL Change %', category: 'Price Change' },
    header: ({ column }) => sortableHeader(column, 'ATL Change %'),
    cell: (row) => formatPercentageChangeCell(row),
  },
  {
    id: 'atl_date',
    accessorKey: 'atl_date',
    meta: { label: 'ATL Date', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'ATL Date'),
    cell: (row) => formatDateCell(row),
  },
  {
    id: 'roi',
    accessorKey: 'roi',
    meta: { label: 'ROI', category: 'Market' },
    header: ({ column }) => sortableHeader(column, 'ROI'),
  },
  {
    id: 'last_updated',
    accessorKey: 'last_updated',
    meta: { label: 'Last Updated' },
    header: ({ column }) => sortableHeader(column, 'Last Updated'),
    cell: (props) => formatDateCell(props, { mode: 'time' }),
  },
]
