import type { CoinChartDataType } from '@/features/market/components/coin-page/coin-chart/types'
import type { CoinsList } from '@/features/market/types/coins-list'

export type ChartItem = {
  id: string
  coin: CoinsList
  days: string
  dataType: CoinChartDataType
}

export type Multichart = {
  id: string
  name: string
  isDefault?: boolean
  charts: ChartItem[]
}

export type SortBy = 'rank' | 'price' | 'market_cap' | 'volume'
