import {
  ChartCandlestick,
  ChartLine,
  Download,
  Maximize,
  Minimize,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import type { CoinChartDataType, CoinChartMode } from './types'

type CoinChartControlsProps = {
  dataType: CoinChartDataType
  onDataTypeChange: (value: CoinChartDataType) => void
  chartMode: CoinChartMode
  onChartModeChange: (value: CoinChartMode) => void
  days: string
  ytdDays: string
  onDaysChange: (value: string) => void
  onDownload: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  isLoading?: boolean
}

export function CoinChartControls({
  dataType,
  onDataTypeChange,
  chartMode,
  onChartModeChange,
  days,
  ytdDays,
  onDaysChange,
  onDownload,
  onToggleFullscreen,
  isFullscreen,
  isLoading,
}: CoinChartControlsProps) {
  return (
    <div className='flex flex-col gap-2 md:p-2 lg:flex-row md:justify-between'>
      <div className='flex min-w-0 gap-2 overflow-x-auto pb-1 md:overflow-visible md:pb-0 justify-between'>
        <ToggleGroup
          type='single'
          value={dataType}
          onValueChange={(v) => v && onDataTypeChange(v as CoinChartDataType)}
          disabled={isLoading || chartMode === 'candles'}
          className='shrink-0 [&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
        >
          <ToggleGroupItem value='price' variant='outline'>
            Price
          </ToggleGroupItem>
          <ToggleGroupItem value='marketCap' variant='outline'>
            Market Cap
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          type='single'
          value={chartMode}
          onValueChange={(value) => {
            if (
              value === 'line' ||
              value === 'candles' ||
              value === 'tradingview'
            ) {
              onChartModeChange(value)
            }
          }}
          disabled={isLoading}
          className='shrink-0 [&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
        >
          <ToggleGroupItem variant='outline' value='line'>
            <ChartLine className='h-4 w-4' />
          </ToggleGroupItem>
          <ToggleGroupItem variant='outline' value='candles'>
            <ChartCandlestick className='h-4 w-4' />
          </ToggleGroupItem>
          <ToggleGroupItem
            variant='outline'
            value='tradingview'
            className='gap-1'
          >
            <ChartCandlestick className='h-4 w-4' />
            <span className='hidden sm:inline'>TradingView</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='flex min-w-0 gap-2 overflow-x-auto pb-1 md:overflow-visible md:pb-0 justify-between '>
        <ToggleGroup
          type='single'
          value={days}
          onValueChange={(v) => v && onDaysChange(v)}
          disabled={isLoading}
          className='shrink-0 [&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
        >
          <ToggleGroupItem value='1' variant='outline'>
            24H
          </ToggleGroupItem>
          <ToggleGroupItem value='7' variant='outline'>
            7D
          </ToggleGroupItem>
          <ToggleGroupItem value='30' variant='outline'>
            1M
          </ToggleGroupItem>
          <ToggleGroupItem value='90' variant='outline'>
            3M
          </ToggleGroupItem>
          <ToggleGroupItem
            value={chartMode === 'candles' ? '180' : ytdDays}
            variant='outline'
          >
            {chartMode === 'candles' ? '6M' : 'YTD'}
          </ToggleGroupItem>
          <ToggleGroupItem value='365' variant='outline'>
            1Y
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          variant='outline'
          size='icon'
          onClick={onDownload}
          disabled={chartMode === 'tradingview' || isLoading}
        >
          <Download className='h-4 w-4' />
        </Button>

        <Button
          size='icon'
          variant='outline'
          onClick={onToggleFullscreen}
          disabled={isLoading}
          className='hidden md:flex'
        >
          {isFullscreen ? (
            <Minimize className='h-4 w-4' />
          ) : (
            <Maximize className='h-4 w-4' />
          )}
        </Button>
      </div>
    </div>
  )
}
