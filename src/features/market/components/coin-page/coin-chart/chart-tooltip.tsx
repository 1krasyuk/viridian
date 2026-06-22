import { BarChart2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getLineColor } from '@/shared/lib/chart-config'
import type {
  CoinChartDataType,
  CoinChartMode,
  CoinChartTooltipState,
} from './types'
import { useCurrency } from '@/features/currency/hooks'

type CoinChartTooltipProps = {
  tooltip: CoinChartTooltipState
  chartMode: CoinChartMode
  dataType: CoinChartDataType
  view: 'classic' | 'terminal'
  prices: { time: number; value: number }[]
  colors: ReturnType<typeof import('@/shared/lib/chart-config').getChartColors>
  baseValue: number
}

export function CoinChartTooltip({
  tooltip,
  chartMode,
  dataType,
  view,
  prices,
  colors,
  baseValue,
}: CoinChartTooltipProps) {
  const { format } = useCurrency()

  if (!tooltip) return null

  if (chartMode === 'line') {
    return (
      <div
        className='absolute z-50 pointer-events-none bg-card border rounded-sm px-3 py-2 text-xs shadow-md min-w-50'
        style={{
          left: `clamp(12px, ${tooltip.x + 12}px, calc(100% - 212px))`,
          top: `clamp(12px, ${tooltip.y + 12}px, calc(100% - 90px))`,
        }}
      >
        <div className='flex items-center justify-between mb-2'>
          <div className='font-bold text-xs text-sidebar-foreground'>
            {tooltip.date}
          </div>
          <div className='text-muted-foreground font-semibold text-xs'>
            {tooltip.time}
          </div>
        </div>

        <div className='flex items-center gap-2 text-sm mb-1'>
          <span
            className={`w-2 h-2 rounded-full ${
              dataType === 'marketCap'
                ? 'bg-blue-500'
                : view === 'classic'
                  ? getLineColor(prices, colors) === colors.positive
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                  : tooltip.value >= baseValue
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
            }`}
          />
          <span className='font-semibold text-muted-foreground'>
            {dataType === 'price' ? 'Price:' : 'Market Cap:'}
          </span>
          <span className='font-bold'>
            {format(tooltip.value, {
              notation: dataType === 'marketCap' ? 'compact' : 'standard',
            })}
          </span>
        </div>

        <div className='flex items-center gap-1.5 text-sm'>
          <BarChart2 className='w-3 h-3 text-muted-foreground' />
          <span className='font-semibold text-muted-foreground'>Volume:</span>
          <span className='font-bold'>
            {tooltip.volume > 0
              ? format(tooltip.volume, { notation: 'compact' })
              : '—'}
          </span>
        </div>
      </div>
    )
  }

  if (chartMode !== 'candles') return null

  // === Candles: inline format ===
  const candleFormat = (value?: number) =>
    format(value ?? 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  return (
    <div
      className='absolute z-50 pointer-events-none bg-card border rounded-sm px-3 py-2 text-xs shadow-md min-w-50'
      style={{
        left: `clamp(12px, ${tooltip.x + 12}px, calc(100% - 232px))`,
        top: `clamp(12px, ${tooltip.y + 12}px, calc(100% - 90px))`,
      }}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='font-bold text-xs text-sidebar-foreground'>
          {tooltip.date}
        </div>
        <div className='text-muted-foreground font-semibold text-xs'>
          {tooltip.time}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-x-3 gap-y-1 text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Open:</span>
          <span className='font-mono font-bold text-foreground'>
            {candleFormat(tooltip.open)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Close:</span>
          <span
            className={cn(
              'font-mono font-bold',
              tooltip.close! >= tooltip.open!
                ? 'text-emerald-500'
                : 'text-red-500',
            )}
          >
            {candleFormat(tooltip.close)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>High:</span>
          <span className='font-mono font-bold text-muted-foreground'>
            {candleFormat(tooltip.high)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Low:</span>
          <span className='font-mono font-bold text-muted-foreground'>
            {candleFormat(tooltip.low)}
          </span>
        </div>
      </div>
    </div>
  )
}
