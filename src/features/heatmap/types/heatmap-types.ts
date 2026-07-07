import type { CoinsList } from '@/features/market/types/coins-list'

export type HeatmapPeriod = '1h' | '24h' | '7d' | '30d' | '1y'
export type HeatmapSizeMetric = 'market_cap' | 'total_volume'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type HeatmapNode = {
  coin: CoinsList
  value: number
  rect: Rect
}

export const DEFAULT_HEATMAP_PERIOD: HeatmapPeriod = '24h'
export const DEFAULT_HEATMAP_SIZE: HeatmapSizeMetric = 'market_cap'
export const MAX_HEATMAP_COINS = 250

export const CHANGE_RANGES = [
  { id: 'lt-13', label: '-13%', min: -Infinity, max: -13 },
  { id: '13-8-down', label: '-8%', min: -13, max: -8 },
  { id: '8-3-down', label: '-3%', min: -8, max: -3 },
  { id: '3-0-down', label: '0%', min: -3, max: 0 },
  { id: '0-3-up', label: '+3%', min: 0, max: 3 },
  { id: '3-8-up', label: '+8%', min: 3, max: 8 },
  { id: '8-13-up', label: '+13%', min: 8, max: 13 },
] as const

export type ChangeRangeId = (typeof CHANGE_RANGES)[number]['id']

export const DEFAULT_CHANGE_RANGES = CHANGE_RANGES.map((range) => range.id)

export const PERIODS: { value: HeatmapPeriod; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
]

export const SIZE_METRICS: { value: HeatmapSizeMetric; label: string }[] = [
  { value: 'market_cap', label: 'Market cap' },
  { value: 'total_volume', label: 'Volume' },
]
