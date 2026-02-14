export interface Coin {
  market_cap_rank: number
  image: string
  name: string
  symbol: string
  current_price: number
  price_change_24h: number | null
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
  price_change_percentage_30d_in_currency: number | null
  price_change_percentage_1y_in_currency: number | null
  market_cap: number
  total_volume: number
  circulating_supply: number
  sparkline_in_7d?: {
    price: number[]
  }
  high_24h: number
  low_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  roi: number | null
  last_updated: string
}
