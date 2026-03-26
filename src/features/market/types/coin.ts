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

  detail_platforms?: Record<string, { contract_address: string }>
  platforms?: Record<string, string>

  links: {
    homepage: string[]
    whitepaper?: string
    blockchain_site: string[]
    subreddit_url?: string
    twitter_screen_name?: string
    facebook_username?: string
    telegram_channel_identifier?: string
    official_forum_url?: string[]
    repos_url?: {
      github: string[]
    }
  }

  market_data: {
    current_price: Record<string, number>
    price_change_percentage_24h: number | null

    market_cap: Record<string, number>
    market_cap_change_percentage_24h: number | null

    total_volume: Record<string, number>
    fully_diluted_valuation: Record<string, number>

    total_supply: number | null
    max_supply: number | null
    max_supply_infinite: boolean
    circulating_supply: number | null

    high_24h: Record<string, number>
    low_24h: Record<string, number>

    ath: Record<string, number>
    ath_change_percentage: Record<string, number>
    ath_date: Record<string, string>

    atl: Record<string, number>
    atl_change_percentage: Record<string, number>
    atl_date: Record<string, string>
  }

  sentiment_votes_up_percentage: number
  sentiment_votes_down_percentage: number

  categories: string[]

  watchlist_portfolio_users: number

  description: Record<string, string>
}
