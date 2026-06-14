// features/market/components/coin-page/coin-tickers-table/index.tsx
import * as React from 'react'
import type { PaginationState } from '@tanstack/react-table'
import type { ExchangeType, MarketType } from './types'
import type { Ticker } from '@/features/market/types/tickers'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { Search } from 'lucide-react'

interface CoinTickersTableProps {
  tickers: Ticker[]
  loading?: boolean
  coinName: string
  mode: 'pagination' | 'infinite'
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
export const DEX_IDENTIFIERS = [
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
  coinName,
  mode,
}: CoinTickersTableProps) {
  const [exchangeType, setExchangeType] = React.useState<ExchangeType>('all')
  const [marketType, setMarketType] = React.useState<MarketType>('all')
  const [search, setSearch] = React.useState('')
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

    // Filter by search (exchange name)
    if (search.trim()) {
      result = result.filter((ticker) =>
        ticker.market.name.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return result
  }, [tickers, exchangeType, marketType, search])

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

  const resetPagination = () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const changeExchangeType = (value: ExchangeType) => {
    setExchangeType(value)
    resetPagination()
  }

  const changeMarketType = (value: MarketType) => {
    setMarketType(value)
    resetPagination()
  }

  const changeSearch = (value: string) => {
    setSearch(value)
    resetPagination()
  }

  const hasActiveFilters =
    exchangeType !== 'all' || marketType !== 'all' || search !== ''

  const resetFilters = () => {
    setExchangeType('all')
    setMarketType('all')
    setSearch('')
    resetPagination()
  }

  return (
    <div className='w-full space-y-4'>
      <div
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
          mode === 'infinite' && 'px-4',
        )}
      >
        <div className='flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3'>
          <h2 className='text-lg font-semibold sm:text-xl'>
            {coinName} Markets
          </h2>
          <div className='relative w-full sm:w-auto'>
            <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search exchange...'
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className='h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring sm:h-7 sm:w-auto'
            />
          </div>
        </div>
        <div className='flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto justify-between sm:flex-wrap sm:overflow-visible sm:pb-0'>
          {/* Exchange type filters */}
          <div className='flex shrink-0 items-center gap-1 bg-muted rounded-lg p-1'>
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
                onClick={() => changeExchangeType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Market type filters */}
          <div className='flex shrink-0 items-center gap-1 bg-muted rounded-lg p-1'>
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
                onClick={() => changeMarketType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        mode={mode}
        columns={columns}
        data={sortedTickers}
        loading={loading}
        pagination={pagination}
        onPaginationChange={setPagination}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}
