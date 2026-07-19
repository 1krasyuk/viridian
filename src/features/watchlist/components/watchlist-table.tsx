import { DataTable } from '@/features/market/components/coins-table/data-table'
import { columns } from '@/features/market/components/coins-table/columns'
import type { CoinsList } from '@/features/market/types/coins-list'
import type { CellContext } from '@tanstack/react-table'
import { useWatchlistStore } from '../store/watchlist-store'
import { useCurrency } from '@/features/currency/hooks'
import { useIsMobile } from '@/shared/hooks/use-mobile'

const watchlistColumns = columns.map((column) => {
  if (column.id !== 'market_cap_rank') return column

  return {
    ...column,
    meta: { label: 'Watchlist Rank', category: 'General' },
    cell: ({ row }: CellContext<CoinsList, unknown>) => (
      <div className='text-center'>{row.index + 1}</div>
    ),
  }
})

export function WatchlistTable() {
  const coins = useWatchlistStore((state) => state.coins)
  const clearWatchlist = useWatchlistStore((state) => state.clearWatchlist)
  const { currency } = useCurrency()
  const isMobile = useIsMobile()

  return (
    <DataTable
      columns={watchlistColumns}
      data={coins}
      loading={false}
      page={1}
      perPage={coins.length || 1}
      pageCount={1}
      onPageChange={() => undefined}
      category={undefined}
      onCategoryChange={() => undefined}
      showCategoryFilter={false}
      showRowsSelector={false}
      showPagination={false}
      currency={currency}
      compactMarketNumbers={isMobile}
      clearWatchlist={clearWatchlist}
    />
  )
}
