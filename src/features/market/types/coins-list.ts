export interface CoinsList {
  id: string
  market_cap_rank: number | null
  image: string
  name: string
  symbol: string
  current_price: number | null
  price_change_24h: number | null
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
  price_change_percentage_30d_in_currency: number | null
  price_change_percentage_1y_in_currency: number | null
  market_cap: number | null
  total_volume: number | null
  circulating_supply: number | null
  sparkline_in_7d?: {
    price: number[]
  }
  high_24h: number | null
  low_24h: number | null
  market_cap_change_24h: number | null
  market_cap_change_percentage_24h: number | null
  total_supply: number | null
  max_supply: number | null
  ath: number | null
  ath_change_percentage: number | null
  ath_date: string | null
  atl: number | null
  atl_change_percentage: number | null
  roi: number | null
  last_updated: string
}
