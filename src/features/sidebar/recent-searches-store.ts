import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RecentSearchItem = {
  id: string
  name: string
  type?: 'coin' | 'category'
  symbol?: string
  image?: string
}

type RecentSearchesState = {
  coins: RecentSearchItem[]
  addCoin: (coin: RecentSearchItem) => void
  addCategory: (category: RecentSearchItem) => void
  removeCoin: (coinId: string) => void
  clearCoins: () => void
}

const MAX_RECENT_COINS = 8

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      coins: [],
      addCoin: (coin) =>
        set((state) => ({
          coins: [
            { ...coin, type: 'coin' as const },
            ...state.coins.filter((item) => item.id !== coin.id),
          ].slice(0, MAX_RECENT_COINS),
        })),
      addCategory: (category) =>
        set((state) => ({
          coins: [
            { ...category, type: 'category' as const },
            ...state.coins.filter((item) => item.id !== category.id),
          ].slice(0, MAX_RECENT_COINS),
        })),
      removeCoin: (coinId) =>
        set((state) => ({
          coins: state.coins.filter((item) => item.id !== coinId),
        })),
      clearCoins: () => set({ coins: [] }),
    }),
    { name: 'viridian-recent-search-coins' },
  ),
)
