import { useEffect } from 'react'
import { useCurrencyStore } from '@/features/currency/store'
import { useWatchlistStore } from '../store/watchlist-store'
import { coinsApi } from '@/features/market/api/coins-api'
import type { CoinsList } from '@/features/market/types/coins-list'

export function useWatchlistSync() {
  const currency = useCurrencyStore((s) => s.currency)
  const coins = useWatchlistStore((s) => s.coins)
  const setCoins = useWatchlistStore((s) => s.setCoins)

  useEffect(() => {
    if (coins.length === 0) return

    const ids = coins.map((c) => c.id).join(',')

    coinsApi
      .getCoins({
        vs_currency: currency,
        ids,
        per_page: coins.length,
        page: 1,
      })
      .then((fresh: CoinsList[]) => {
        const merged = coins.map((old) => {
          const freshCoin = fresh.find((f) => f.id === old.id)
          if (!freshCoin) return old
          return { ...old, ...freshCoin }
        })
        setCoins(merged)
      })
      .catch(() => {})
  }, [currency]) // eslint-disable-line react-hooks/exhaustive-deps
}
