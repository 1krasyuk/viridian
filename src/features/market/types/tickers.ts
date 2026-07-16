export interface Ticker {
  base: string
  target: string

  market: {
    name: string
    identifier: string
    has_trading_incentive: boolean
  }

  last: number
  volume: number

  converted_last: Record<string, number>
  converted_volume: Record<string, number>

  trust_score: string | null
  bid_ask_spread_percentage: number

  timestamp: string
  last_traded_at: string
  last_fetch_at: string

  is_anomaly: boolean
  is_stale: boolean

  trade_url: string | null
  token_info_url: string | null

  coin_id: string
  target_coin_id: string

  coin_mcap_usd: number
}
