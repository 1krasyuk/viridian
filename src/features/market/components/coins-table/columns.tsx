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

      return <div className='text-right font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'price_change_percentage_24h',
    header: '24h Price Change %',
    cell: ({ row }) => {
      const raw = row.original.price_change_percentage_24h
      const formatted = row.original.price_change_percentage_24h.toFixed(2)
      return (
        <div
          title={raw.toString()}
          className={
            raw > 0
              ? 'text-emerald-500'
              : raw < 0
                ? 'text-destructive'
                : 'text-muted-foreground'
          }
        >
          {raw > 0 ? '+' : ''}
          {formatted}%
        </div>
      )
    },
  },
  {
    accessorKey: 'price_change_24h',
    header: '24h Price Change',
  },
  {
    accessorKey: 'high_24h',
    header: '24h High',
  },
  {
    accessorKey: 'low_24h',
    header: '24h Low',
  },
  {
    accessorKey: 'market_cap',
    header: 'Market Cap',
  },
  {
    accessorKey: 'market_cap_change_24h',
    header: '24h Market Cap Change',
  },
  {
    accessorKey: 'total_volume',
    header: 'Total Volume',
  },
  {
    accessorKey: 'circulating_supply',
    header: 'Circulating Supply',
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
