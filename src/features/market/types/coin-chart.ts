export interface CoinChart {
  id: string
  vs_currency: string
  days: string
  interval: 'daily' | 'hourly'
  prices: number[][]
  market_caps: number[][]
  total_volumes: number[][]
}
