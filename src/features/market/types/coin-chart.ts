import type { UTCTimestamp } from 'lightweight-charts'

export interface CoinChartRaw {
  id: string
  vs_currency: string
  days: string
  interval: 'daily' | 'hourly'
  prices: number[][]
  market_caps: number[][]
  total_volumes: number[][]
}

export interface CoinChart {
  id: string
  vs_currency: string
  days: string
  interval: 'daily' | 'hourly'
  prices: { time: UTCTimestamp; value: number }[]
  market_caps: { time: UTCTimestamp; value: number }[]
  total_volumes: { time: UTCTimestamp; value: number }[]
}
