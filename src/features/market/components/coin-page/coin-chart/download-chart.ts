import type { IChartApi } from 'lightweight-charts'
import type { CoinChartMode } from './types'

export function downloadChartImage({
  chartApi,
  days,
  ytdDays,
  symbol,
  chartMode,
  isDark,
}: {
  chartApi: IChartApi | null
  days: string
  ytdDays: string
  symbol: string | undefined
  chartMode: CoinChartMode
  isDark: boolean
}) {
  if (!chartApi) return

  const periodMap: Record<string, string> = {
    '1': '1d',
    '7': '7d',
    '30': '30d',
    '90': '3m',
    [ytdDays]: 'ytd',
    '365': '1y',
  }

  const period = periodMap[days] || `${days}d`
  const coin = (symbol || 'unknown').toLowerCase()

  const now = new Date()
  const date = now.toLocaleDateString('en-CA').replaceAll('-', '.')
  const time = now.toTimeString().slice(0, 5).replace(':', '.')

  const filename = `${coin}-${period}-${chartMode}-chart-viridian ${date}-${time}.png`

  const original = chartApi.takeScreenshot()
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = isDark ? '#09090b' : '#ffffff'
  ctx.fillRect(0, 0, 1920, 1080)

  const scale = Math.min(1920 / original.width, 1080 / original.height)
  const w = original.width * scale
  const h = original.height * scale
  const x = (1920 - w) / 2
  const y = (1080 - h) / 2

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(original, x, y, w, h)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename
  link.click()
}
