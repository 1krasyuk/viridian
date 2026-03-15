export interface Coin {
  id: string
  symbol: string
  name: string
  image: {
    thumb: string
    small: string
    large: string
  }
  market_cap_rank: number
  market_data: {
    current_price: Record<string, number>
    price_change_percentage_24h: number | null
  }
}
