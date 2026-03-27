export interface TickerMarket {
  name: string
  identifier: string
  has_trading_incentive: boolean
}

export interface TickerConvertedValues {
  btc: number
  eth: number
  usd: number
}

export type ExchangeType = 'all' | 'cex' | 'dex'
export type MarketType = 'all' | 'spot' | 'perpetual' | 'futures'
