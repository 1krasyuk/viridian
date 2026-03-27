import type { CellContext, Column, ColumnDef } from '@tanstack/react-table'
import type { Ticker } from '@/features/market/types/tickers'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Link } from '@tanstack/react-router'

function sortableHeader<TData, TValue>(
  column: Column<TData, TValue>,
  title: string,
) {
  const isSorted = column.getIsSorted()

  return (
    <Button
      variant='ghost'
      className='px-0 gap-0.5 bg-transparent! h-auto'
      onClick={() => column.toggleSorting()}
    >
      {title}
      <div className='flex flex-col'>
        <ChevronUp
          className={cn(
            'transition-colors -mb-2 w-3 h-3',
            isSorted === 'asc' ? 'text-primary' : 'text-muted-foreground/50',
          )}
        />
        <ChevronDown
          className={cn(
            'transition-colors w-3 h-3',
            isSorted === 'desc' ? 'text-primary' : 'text-muted-foreground/50',
          )}
        />
      </div>
    </Button>
  )
}

function formatCurrencyCell<TData extends Ticker, TValue>(
  context: CellContext<TData, TValue>,
  options?: {
    maximumFractionDigits?: number
    naText?: string
    showSign?: boolean
    colored?: boolean
    useCompact?: boolean
  },
) {
  const value = context.getValue() as number | null | undefined
  const {
    maximumFractionDigits = 2,
    naText = '—',
    showSign = false,
    colored = false,
    useCompact = false,
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

  const prefix = showSign && value > 0 ? '+' : ''

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: showSign ? 'never' : 'auto',
    maximumFractionDigits,
    notation: useCompact ? 'compact' : 'standard',
    compactDisplay: 'short',
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

function formatPercentageCell<TData extends Ticker, TValue>(
  context: CellContext<TData, TValue>,
  options?: {
    maximumFractionDigits?: number
    naText?: string
    colored?: boolean
  },
) {
  const value = context.getValue() as number | null | undefined
  const {
    maximumFractionDigits = 2,
    naText = '—',
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

  const formatted = `${value.toFixed(maximumFractionDigits)}%`

  return (
    <div title={value.toString()} className={colorClass || undefined}>
      {formatted}
    </div>
  )
}

function formatTimeAgoCell<TData extends Ticker, TValue>(
  context: CellContext<TData, TValue>,
) {
  const value = context.getValue() as string | null | undefined

  if (value == null) {
    return <div className='text-muted-foreground'>—</div>
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return <div className='text-muted-foreground'>—</div>
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let text: string
  if (diffMins < 1) {
    text = 'Just now'
  } else if (diffMins < 60) {
    text = `${diffMins}m ago`
  } else if (diffHours < 24) {
    text = `${diffHours}h ago`
  } else if (diffDays < 30) {
    text = `${diffDays}d ago`
  } else {
    text = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return <div className='text-muted-foreground'>{text}</div>
}

export interface ColumnsOptions {
  totalVolume?: number
}

export const getColumns = (options?: ColumnsOptions): ColumnDef<Ticker>[] => {
  const { totalVolume = 0 } = options ?? {}

  return [
    {
      id: 'index',
      header: () => <div className='text-center w-10'>#</div>,
      enableHiding: false,
      cell: ({ row }) => (
        <div className='text-center text-muted-foreground w-10'>
          {row.index + 1}
        </div>
      ),
    },
    {
      id: 'exchange',
      accessorKey: 'market.name',
      header: ({ column }) => (
        <div className='text-left'>{sortableHeader(column, 'Exchange')}</div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const { market } = row.original
        return (
          <div className='flex items-center gap-2 min-w-15'>
            <div className='w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium'>
              {market.name.charAt(0)}
            </div>
            <span className='font-medium truncate'>{market.name}</span>
          </div>
        )
      },
    },
    {
      id: 'type',
      header: () => <div className='text-center'></div>,
      enableHiding: false,
      cell: ({ row }) => {
        const isDex = [
          'uniswap',
          'pancakeswap',
          'sushiswap',
          'curve',
          'balancer',
          '1inch',
        ].some((dex) =>
          row.original.market.identifier.toLowerCase().includes(dex),
        )
        return (
          <div className='flex justify-center'>
            <Badge
              variant={isDex ? 'secondary' : 'outline'}
              className={cn(
                'text-xs rounded-md',
                isDex &&
                  'bg-purple-500/10 text-purple-500 border-purple-500/20',
              )}
            >
              {isDex ? 'DEX' : 'CEX'}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'pair',
      accessorKey: 'base',
      header: ({ column }) => (
        <div className='text-left'>{sortableHeader(column, 'Pair')}</div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const { base, target, trade_url, coin_id, target_coin_id } =
          row.original

        const format = (val: string, id?: string) => {
          if (id) return id.toUpperCase().slice(0, 10)
          if (val?.startsWith('0x')) return val.slice(0, 6) + '...'
          return val
        }

        const pair = `${format(base, coin_id)}/${format(target, target_coin_id)}`

        return (
          <div className='flex items-center gap-1 min-w-10'>
            {trade_url && (
              <Link
                to={trade_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap'
                onClick={(e) => e.stopPropagation()}
              >
                <span className='font-medium'>{pair}</span>
                <ExternalLink className='w-3.5 h-3.5 shrink-0' />
              </Link>
            )}
          </div>
        )
      },
    },
    {
      id: 'price',
      accessorKey: 'last',
      header: ({ column }) => sortableHeader(column, 'Price'),
      cell: (ctx) => formatCurrencyCell(ctx, { maximumFractionDigits: 8 }),
    },
    {
      id: 'spread',
      accessorKey: 'bid_ask_spread_percentage',
      header: ({ column }) => sortableHeader(column, 'Spread'),
      cell: (ctx) => formatPercentageCell(ctx, { maximumFractionDigits: 3 }),
    },
    {
      id: 'volume',
      accessorKey: 'converted_volume.usd',
      header: ({ column }) => sortableHeader(column, '24h Volume'),
      cell: (ctx) =>
        formatCurrencyCell(ctx, { useCompact: true, maximumFractionDigits: 0 }),
    },
    {
      id: 'volume_percentage',
      header: ({ column }) => sortableHeader(column, 'Volume %'),
      accessorFn: (row) => {
        if (totalVolume === 0) return 0
        return (row.converted_volume.usd / totalVolume) * 100
      },
      cell: (ctx) => formatPercentageCell(ctx, { maximumFractionDigits: 2 }),
    },
    {
      id: 'last_updated',
      accessorKey: 'last_fetch_at',
      header: ({ column }) => sortableHeader(column, 'Last Updated'),
      cell: (ctx) => formatTimeAgoCell(ctx),
    },
  ]
}
