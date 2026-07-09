import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Coin } from '@/features/market/types/coin'

export type RecentlyVisitedCoin = {
  id: string
  name: string
  image: string
  currentPrice?: number | null
  currency?: string
  priceChangePercentage24h?: number | null
}

type RecentlyVisitedState = {
  coins: RecentlyVisitedCoin[]
  addCoin: (coin: RecentlyVisitedCoin) => void
  addVisitedCoin: (coin: Coin, currency: string) => void
}

const MAX_RECENTLY_VISITED = 8

export const useRecentlyVisitedStore = create<RecentlyVisitedState>()(
  persist(
    (set) => ({
      coins: [],
      addCoin: (coin) =>
        set((state) => ({
          coins: [
            coin,
            ...state.coins.filter((item) => item.id !== coin.id),
          ].slice(0, MAX_RECENTLY_VISITED),
        })),
      addVisitedCoin: (coin, currency) =>
        set((state) => {
          const normalizedCurrency = currency.toLowerCase()
          const visitedCoin = {
            id: coin.id,
            name: coin.name,
            image: coin.image.small,
            currentPrice:
              coin.market_data.current_price?.[normalizedCurrency] ??
              coin.market_data.current_price?.usd ??
              null,
            currency: normalizedCurrency,
            priceChangePercentage24h:
              coin.market_data.price_change_percentage_24h,
          }

          return {
            coins: [
              visitedCoin,
              ...state.coins.filter((item) => item.id !== coin.id),
            ].slice(0, MAX_RECENTLY_VISITED),
          }
        }),
    }),
    {
      name: 'viridian-recently-visited-coins',
      partialize: (state) => ({ coins: state.coins }),
    },
  ),
)
