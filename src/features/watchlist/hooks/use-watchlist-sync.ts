import { useEffect } from 'react'
import { useCurrencyStore } from '@/features/currency/store'
import { useCoins } from '@/features/market/hooks/coins-queries'
import { useWatchlistStore } from '../store/watchlist-store'

export function useWatchlistSync() {
  const currency = useCurrencyStore((s) => s.currency)
  const coins = useWatchlistStore((s) => s.coins)
  const setCoins = useWatchlistStore((s) => s.setCoins)
  const ids = coins.map((coin) => coin.id).join(',')
  const { data: freshCoins = [] } = useCoins(
    1,
    Math.max(coins.length, 1),
    undefined,
    currency,
    coins.length > 0,
    0,
    60000,
    300000,
    ids || undefined,
  )

  useEffect(() => {
    if (freshCoins.length === 0) return

    const freshById = new Map(freshCoins.map((coin) => [coin.id, coin]))
    const changed = coins.some((old) => {
      const fresh = freshById.get(old.id)
      return (
        fresh &&
        Object.entries(fresh).some(
          ([key, value]) => old[key as keyof typeof old] !== value,
        )
      )
    })
    if (!changed) return

    setCoins(coins.map((old) => ({ ...old, ...(freshById.get(old.id) ?? {}) })))
  }, [coins, freshCoins, setCoins])
}
