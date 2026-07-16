import { useState } from 'react'
import type { CoinChartMode } from './types'

const CHART_MODE_KEY = 'coin-chart-mode'

function isChartMode(value: string | null): value is CoinChartMode {
  return value === 'line' || value === 'candles' || value === 'tradingview'
}

export function useChartMode() {
  const [chartMode, setChartModeState] = useState<CoinChartMode>(() => {
    const saved = localStorage.getItem(CHART_MODE_KEY)
    return isChartMode(saved) ? saved : 'line'
  })

  const setChartMode = (value: CoinChartMode) => {
    setChartModeState(value)
    localStorage.setItem(CHART_MODE_KEY, value)
  }

  return [chartMode, setChartMode] as const
}
