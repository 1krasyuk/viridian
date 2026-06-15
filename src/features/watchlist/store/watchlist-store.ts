import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Coin } from '@/features/market/types/coin'
import type { CoinsList } from '@/features/market/types/coins-list'

type WatchlistState = {
  coins: CoinsList[]
  addCoin: (coin: CoinsList) => void
  removeCoin: (coinId: string) => void
  toggleCoin: (coin: CoinsList) => void
  isWatched: (coinId: string) => boolean
}

const usd = (value: Record<string, number> | undefined) => value?.usd ?? null

export function coinToWatchlistCoin(coin: Coin): CoinsList {
  return {
    id: coin.id,
    market_cap_rank: coin.market_cap_rank,
    image: coin.image.small,
    name: coin.name,
    symbol: coin.symbol,
    current_price: usd(coin.market_data.current_price),
    price_change_24h: coin.market_data.price_change_24h,
    price_change_percentage_1h_in_currency:
      coin.market_data.price_change_percentage_1h_in_currency?.usd ?? null,
    price_change_percentage_24h:
      coin.market_data.price_change_percentage_24h,
    price_change_percentage_7d_in_currency:
      coin.market_data.price_change_percentage_7d_in_currency?.usd ?? null,
    price_change_percentage_30d_in_currency:
      coin.market_data.price_change_percentage_30d_in_currency?.usd ?? null,
    price_change_percentage_1y_in_currency:
      coin.market_data.price_change_percentage_1y_in_currency?.usd ?? null,
    market_cap: usd(coin.market_data.market_cap),
    total_volume: usd(coin.market_data.total_volume),
    circulating_supply: coin.market_data.circulating_supply,
    sparkline_in_7d: coin.market_data.sparkline_7d,
    high_24h: usd(coin.market_data.high_24h),
    low_24h: usd(coin.market_data.low_24h),
    market_cap_change_24h: coin.market_data.market_cap_change_24h,
    market_cap_change_percentage_24h:
      coin.market_data.market_cap_change_percentage_24h,
    total_supply: coin.market_data.total_supply,
    max_supply: coin.market_data.max_supply,
    ath: usd(coin.market_data.ath),
    ath_change_percentage:
      coin.market_data.ath_change_percentage?.usd ?? null,
    ath_date: coin.market_data.ath_date?.usd ?? null,
    atl: usd(coin.market_data.atl),
    atl_change_percentage:
      coin.market_data.atl_change_percentage?.usd ?? null,
    roi: null,
    last_updated: new Date().toISOString(),
  }
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      coins: [],
      addCoin: (coin) =>
        set((state) => {
          if (!state.coins.some((item) => item.id === coin.id)) {
            return { coins: [...state.coins, coin] }
          }

          return {
            coins: state.coins.map((item) =>
              item.id === coin.id ? coin : item,
            ),
          }
        }),
      removeCoin: (coinId) =>
        set((state) => ({
          coins: state.coins.filter((coin) => coin.id !== coinId),
        })),
      toggleCoin: (coin) => {
        if (get().isWatched(coin.id)) {
          get().removeCoin(coin.id)
        } else {
          get().addCoin(coin)
        }
      },
      isWatched: (coinId) => get().coins.some((coin) => coin.id === coinId),
    }),
    {
      name: 'viridian-watchlist',
      partialize: (state) => ({ coins: state.coins }),
    },
  ),
)
