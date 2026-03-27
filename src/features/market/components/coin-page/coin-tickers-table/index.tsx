import * as React from 'react'
import type { PaginationState } from '@tanstack/react-table'
import type { ExchangeType, MarketType } from './types'
import type { Ticker } from '@/features/market/types/tickers'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface CoinTickersTableProps {
  tickers: Ticker[]
  loading?: boolean
  coinName?: string
}

const EXCHANGE_TYPES: { value: ExchangeType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cex', label: 'CEX' },
  { value: 'dex', label: 'DEX' },
]

const MARKET_TYPES: { value: MarketType; label: string }[] = [
  { value: 'all', label: 'Spot' },
  { value: 'perpetual', label: 'Perpetuals' },
  { value: 'futures', label: 'Futures' },
]

// List of DEX identifiers for filtering
const DEX_IDENTIFIERS = [
  'uniswap',
  'pancakeswap',
  'sushiswap',
  'curve',
  'balancer',
  '1inch',
  'dodo',
  'bancor',
  'kyber',
  '0x',
  'serum',
  'raydium',
  'orca',
  'jupiter',
]

export function CoinTickersTable({
  tickers,
  loading,
  coinName = 'Bitcoin',
}: CoinTickersTableProps) {
  const [exchangeType, setExchangeType] = React.useState<ExchangeType>('all')
  const [marketType, setMarketType] = React.useState<MarketType>('all')
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Filter tickers
  const filteredTickers = React.useMemo(() => {
    let result = [...tickers]

    // Filter by exchange type (CEX/DEX)
    if (exchangeType !== 'all') {
      result = result.filter((ticker) => {
        const isDex = DEX_IDENTIFIERS.some((dex) =>
          ticker.market.identifier.toLowerCase().includes(dex),
        )
        return exchangeType === 'dex' ? isDex : !isDex
      })
    }

    // Filter by market type (Spot/Perpetuals/Futures)
    if (marketType !== 'all') {
      if (marketType === 'perpetual') {
        result = result.filter(
          (ticker) =>
            ticker.target.toLowerCase().includes('perp') ||
            ticker.target.toLowerCase().includes('perpetual'),
        )
      } else if (marketType === 'futures') {
        result = result.filter(
          (ticker) =>
            ticker.target.toLowerCase().includes('future') ||
            ticker.target.toLowerCase().includes('quarterly') ||
            ticker.target.toLowerCase().includes('bi-quarterly'),
        )
      }
    }

    return result
  }, [tickers, exchangeType, marketType])

  // Sort by volume (default)
  const sortedTickers = React.useMemo(() => {
    return [...filteredTickers].sort(
      (a, b) => b.converted_volume.usd - a.converted_volume.usd,
    )
  }, [filteredTickers])

  // Calculate total volume for percentage calculation
  const totalVolume = React.useMemo(() => {
    return sortedTickers.reduce((sum, t) => sum + t.converted_volume.usd, 0)
  }, [sortedTickers])

  const columns = React.useMemo(
    () => getColumns({ totalVolume }),
    [totalVolume],
  )

  // Reset pagination when filters change
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [exchangeType, marketType])

  return (
    <div className='w-full space-y-4'>
      {/* Header with filters */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <h2 className='text-xl font-semibold'>{coinName} Markets</h2>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Exchange type filters */}
          <div className='flex items-center gap-1 bg-muted rounded-lg p-1'>
            {EXCHANGE_TYPES.map((type) => (
              <Button
                key={type.value}
                variant='ghost'
                size='sm'
                className={cn(
                  'h-7 px-3 text-xs font-medium rounded-md transition-all',
                  exchangeType === type.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-transparent',
                )}
                onClick={() => setExchangeType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Market type filters */}
          <div className='flex items-center gap-1 bg-muted rounded-lg p-1'>
            {MARKET_TYPES.map((type) => (
              <Button
                key={type.value}
                variant='ghost'
                size='sm'
                className={cn(
                  'h-7 px-3 text-xs font-medium rounded-md transition-all',
                  marketType === type.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-transparent',
                )}
                onClick={() => setMarketType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={sortedTickers}
        loading={loading}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
