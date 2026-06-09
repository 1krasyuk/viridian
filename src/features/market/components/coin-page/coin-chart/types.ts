export type CoinChartDataType = 'price' | 'marketCap'

export type CoinChartMode = 'line' | 'candles' | 'tradingview'

export type CoinChartTooltipState = {
  x: number
  y: number
  date: string
  time: string
  value: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume: number
} | null

export type CoinChartVolumePoint = {
  time: number
  value: number
}
