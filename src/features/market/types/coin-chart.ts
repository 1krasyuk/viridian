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
  prices: { time: string; value: number }[]
  market_caps: { time: string; value: number }[]
  total_volumes: { time: string; value: number }[]
}
