import type { Column, ColumnDef } from '@tanstack/react-table'
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
    meta: { label: 'Price', category: 'Price' },
    header: ({ column }) => sortableHeader(column, 'Current Price'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('current_price'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)

      return <div>{formatted}</div>
    },
  },
  {
    id: 'price_change_percentage_24h',
    accessorKey: 'price_change_percentage_24h',
    meta: { label: '24h%', category: 'Price change' },
    header: ({ column }) => sortableHeader(column, '24h Price Change %'),
    cell: ({ row }) => {
      const price = row.original.price_change_percentage_24h

      const color =
        price == null
          ? 'text-muted-foreground'
          : price > 0
            ? 'dark:text-emerald-400 text-emerald-500'
            : price < 0
              ? 'text-destructive'
              : 'text-muted-foreground'

      const formatted =
        price == null ? '—' : `${price > 0 ? '+' : ''}${price.toFixed(2)}%`

      return (
        <div title={price?.toString() ?? 'No data'} className={color}>
          {formatted}
        </div>
      )
    },
  },
  {
    id: 'price_change_24h',
    accessorKey: 'price_change_24h',
    meta: { label: '24h change', category: 'Price change' },
    header: ({ column }) => sortableHeader(column, '24h Price Change'),
    cell: ({ row }) => {
      const value = row.original.price_change_24h

      const color =
        value == null
          ? 'text-muted-foreground'
          : value > 0
            ? 'text-emerald-400'
            : value < 0
              ? 'text-destructive'
              : 'text-muted-foreground'

      const formatted =
        value == null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}`

      return (
        <div title={value?.toString() ?? 'No data'} className={color}>
          {formatted}
        </div>
      )
    },
  },
  {
    id: 'high_24h',
    accessorKey: 'high_24h',
    meta: { label: 'High 24h', category: 'Price change' },
    header: ({ column }) => sortableHeader(column, '24h High'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('high_24h'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)

      return <div>{formatted}</div>
    },
  },
  {
    id: 'low_24h',
    accessorKey: 'low_24h',
    meta: { label: 'Low 24h', category: 'Price change' },
    header: ({ column }) => sortableHeader(column, '24h Low'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('low_24h'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)

      return <div>{formatted}</div>
    },
  },
  {
    id: 'market_cap',
    accessorKey: 'market_cap',
    meta: { label: 'Market Cap', category: 'Market' },
    header: ({ column }) => sortableHeader(column, 'Market Cap'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('market_cap'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price)

      return <div>{formatted}</div>
    },
  },
  // {
  //   accessorKey: 'market_cap_change_24h',
  //   header: '24h Market Cap Change',
  // },
  {
    id: 'total_volume',
    accessorKey: 'total_volume',
    meta: { label: 'Volume', category: 'Market' },
    header: ({ column }) => sortableHeader(column, 'Total Volume'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('total_volume'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price)

      return <div>{formatted}</div>
    },
  },
  {
    id: 'circulating_supply',
    accessorKey: 'circulating_supply',
    meta: { label: 'Supply', category: 'Market' },
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
    meta: { label: 'Chart 7d', category: 'Chart' },

    accessorKey: 'sparkline_in_7d',
    header: 'Last 7 days',
  },
  //   {
  //     accessorKey: 'market_cap_change_percentage_24h',
  //     header: '24h Market Cap Change %',
  //   },

  //   {
  //     accessorKey: 'total_supply',
  //     header: 'Total Supply',
  //   },
  //   {
  //     accessorKey: 'max_supply',
  //     header: 'Max Supply',
  //   },
  //   {
  //     accessorKey: 'ath',
  //     header: 'All Time High',
  //   },
  //   {
  //     accessorKey: 'ath_change_percentage',
  //     header: 'ATH Change %',
  //   },
  //   {
  //     accessorKey: 'ath_date',
  //     header: 'ATH Date',
  //   },
  //   {
  //     accessorKey: 'atl',
  //     header: 'All Time Low',
  //   },
  //   {
  //     accessorKey: 'atl_change_percentage',
  //     header: 'ATL Change %',
  //   },
  //   {
  //     accessorKey: 'roi',
  //     header: 'ROI',
  //   },
  //   {
  //     accessorKey: 'last_updated',
  //     header: 'Last Updated',
  //   },
]
