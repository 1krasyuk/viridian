import type { ColumnDef } from '@tanstack/react-table'
import type { Coin } from '../../types/coins'
import { Badge } from '@/shared/ui/badge'

export const columns: ColumnDef<Coin>[] = [
  {
    accessorKey: 'market_cap_rank',
    header: () => <div className='text-center'>#</div>,
    cell: ({ row }) => (
      <div className='text-center'>{row.original.market_cap_rank}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: () => <div className='text-left'>Name</div>,
    cell: ({ row }) => {
      const image = row.original.image
      const name = row.original.name
      const symbol = row.original.symbol

      return (
        <div className='flex gap-2'>
          <img src={image} className='w-5 h-5' />
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
    accessorKey: 'current_price',
    header: 'Current Price',
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
    accessorKey: 'price_change_percentage_24h',
    header: '24h Price Change %',
    cell: ({ row }) => {
      const price = row.original.price_change_percentage_24h

      const color =
        price == null
          ? 'text-muted-foreground'
          : price > 0
            ? 'text-emerald-400'
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
    accessorKey: 'price_change_24h',
    header: '24h Price Change',
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
    accessorKey: 'high_24h',
    header: '24h High',
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
    accessorKey: 'low_24h',
    header: '24h Low',
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
    accessorKey: 'market_cap',
    header: 'Market Cap',
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
    accessorKey: 'total_volume',
    header: 'Total Volume',
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
    accessorKey: 'circulating_supply',
    header: 'Circulating Supply',
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
