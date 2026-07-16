export interface TrendingCoin {
  id: string
  name: string
  api_symbol: string
  symbol: string
  market_cap_rank: number
  thumb: string
  small: string
  large: string
  slug: string
  price_btc: number
  score: number
  data: {
    price: number
    price_btc: string
    price_change_percentage_24h: {
      usd: number
    }
    market_cap: string
    total_volume: string
    sparkline: string
  }
}

export interface TrendingNft {
  id: string
  name: string
  symbol: string
  thumb: string
  slug: string
  nft_contract_id: number
  floor_price_in_native_currency: number
  floor_price_24h_percentage_change: number
  data: {
    floor_price: string
    floor_price_in_usd_24h_percentage_change: string
    h24_volume: string
    sparkline: string
  }
}

export interface TrendingCategory {
  id: number
  name: string
  coins_count: number
  data: {
    market_cap: number
    market_cap_change_percentage_24h_usd: number
    volume: number
    sparkline: string
  }
}

export interface TrendingResponse {
  coins: { item: TrendingCoin }[]
  nfts: { item: TrendingNft }[]
  categories: TrendingCategory[]
}
