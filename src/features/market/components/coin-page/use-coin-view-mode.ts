import { useState } from 'react'

export type CoinViewMode = 'pagination' | 'infinite'

const COIN_VIEW_MODE_KEY = 'coin-view-mode'

function isCoinViewMode(value: string | null): value is CoinViewMode {
  return value === 'pagination' || value === 'infinite'
}

export function useCoinViewMode() {
  const [viewMode, setViewMode] = useState<CoinViewMode>(() => {
    const saved = localStorage.getItem(COIN_VIEW_MODE_KEY)
    return isCoinViewMode(saved) ? saved : 'pagination'
  })

  const changeViewMode = (mode: CoinViewMode) => {
    setViewMode(mode)
    localStorage.setItem(COIN_VIEW_MODE_KEY, mode)
  }

  return {
    viewMode,
    setViewMode: changeViewMode,
  }
}
