import type { CoinsList } from '@/features/market/types/coins-list'
import {
  CHANGE_RANGES,
  type ChangeRangeId,
  type HeatmapNode,
  type HeatmapPeriod,
  type Rect,
} from '../types/heatmap-types'

export const NEUTRAL_CHANGE_THRESHOLD = 0.01

export function getChange(coin: CoinsList, period: HeatmapPeriod) {
  switch (period) {
    case '1h':
      return coin.price_change_percentage_1h_in_currency
    case '7d':
      return coin.price_change_percentage_7d_in_currency
    case '30d':
      return coin.price_change_percentage_30d_in_currency
    case '1y':
      return coin.price_change_percentage_1y_in_currency
    case '24h':
    default:
      return coin.price_change_percentage_24h
  }
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '--'
  if (Math.abs(value) < NEUTRAL_CHANGE_THRESHOLD) return '0.00%'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function getTileColors(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return {
      background: 'color-mix(in oklch, var(--muted) 70%, transparent)',
      borderColor: 'color-mix(in oklch, var(--border) 80%, transparent)',
      color: 'var(--muted-foreground)',
      glow: 'transparent',
    }
  }

  if (Math.abs(value) < NEUTRAL_CHANGE_THRESHOLD) {
    return {
      background: 'oklch(30.9% 0 0)',
      borderColor: 'transparent',
      color: 'var(--muted-foreground)',
      glow: 'inset 0 0 18px color-mix(in oklch, white 5%, transparent)',
    }
  }

  if (value > 0) {
    const strength = Math.min(Math.abs(value) / 12, 1)
    const alpha = 0.64 + strength * 0.28
    return {
      background: `hsl(158 92% 42% / ${alpha})`,
      borderColor: 'transparent',
      color: 'white',
      glow: `inset 0 0 18px hsl(150 100% 68% / ${0.08 + strength * 0.14}), 0 0 12px hsl(150 100% 48% / ${0.04 + strength * 0.07})`,
    }
  }

  const strength = Math.min(Math.abs(value) / 12, 1)
  const alpha = 0.62 + strength * 0.24
  return {
    background: `hsl(0 84% 60% / ${alpha})`,
    borderColor: 'transparent',
    color: 'white',
    glow: `inset 0 0 18px hsl(350 100% 66% / ${0.08 + strength * 0.13}), 0 0 12px hsl(350 100% 45% / ${0.04 + strength * 0.07})`,
  }
}

export function isChangeInRanges(
  value: number | null | undefined,
  activeRanges: ChangeRangeId[],
) {
  if (value == null || !Number.isFinite(value)) return false
  if (activeRanges.length === 0) return false

  return CHANGE_RANGES.some((range) => {
    if (!activeRanges.includes(range.id)) return false
    return value >= range.min && value <= range.max
  })
}

export function splitTreemap(
  items: { coin: CoinsList; value: number }[],
  rect: Rect,
): HeatmapNode[] {
  if (items.length === 0 || rect.width <= 0 || rect.height <= 0) return []

  const total = items.reduce((acc, item) => acc + item.value, 0)
  const area = rect.width * rect.height
  const scaled = items.map((item) => ({
    ...item,
    area: total > 0 ? (item.value / total) * area : area / items.length,
  }))
  const nodes: HeatmapNode[] = []
  let remaining = { ...rect }
  let row: typeof scaled = []
  let rest = [...scaled]

  const worst = (rowItems: typeof scaled, side: number) => {
    if (rowItems.length === 0) return Infinity
    const areas = rowItems.map((item) => item.area)
    const sum = areas.reduce((acc, item) => acc + item, 0)
    const min = Math.min(...areas)
    const max = Math.max(...areas)
    const sideSquared = side * side

    return Math.max(
      (sideSquared * max) / (sum * sum),
      (sum * sum) / (sideSquared * min),
    )
  }

  const layoutRow = (rowItems: typeof scaled) => {
    const rowArea = rowItems.reduce((acc, item) => acc + item.area, 0)

    if (remaining.width >= remaining.height) {
      const rowWidth = rowArea / remaining.height
      let y = remaining.y

      rowItems.forEach((item) => {
        const height = item.area / rowWidth
        nodes.push({
          coin: item.coin,
          value: item.value,
          rect: {
            x: remaining.x,
            y,
            width: rowWidth,
            height,
          },
        })
        y += height
      })

      remaining = {
        x: remaining.x + rowWidth,
        y: remaining.y,
        width: remaining.width - rowWidth,
        height: remaining.height,
      }
      return
    }

    const rowHeight = rowArea / remaining.width
    let x = remaining.x

    rowItems.forEach((item) => {
      const width = item.area / rowHeight
      nodes.push({
        coin: item.coin,
        value: item.value,
        rect: {
          x,
          y: remaining.y,
          width,
          height: rowHeight,
        },
      })
      x += width
    })

    remaining = {
      x: remaining.x,
      y: remaining.y + rowHeight,
      width: remaining.width,
      height: remaining.height - rowHeight,
    }
  }

  while (rest.length > 0) {
    const item = rest[0]
    const side = Math.min(remaining.width, remaining.height)
    const nextRow = [...row, item]

    if (row.length === 0 || worst(nextRow, side) <= worst(row, side)) {
      row = nextRow
      rest = rest.slice(1)
    } else {
      layoutRow(row)
      row = []
    }
  }

  if (row.length > 0) layoutRow(row)

  return nodes
}
