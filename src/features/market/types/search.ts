export interface SearchCoin {
  id: string
  name: string
  api_symbol: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
  large: string
}

export interface SearchCategory {
  id: string
  name: string
}

export interface SearchResponse {
  coins: SearchCoin[]
  exchanges: unknown[]
  icos: unknown[]
  categories: SearchCategory[]
  nfts: unknown[]
}
