import { useState } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { ChartLine, ChartCandlestick } from 'lucide-react'

export function CoinChart({ symbol }: { symbol: string | undefined }) {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<'simple' | 'tradingview'>('simple')

  const handleChartTypeChange = (value: string) => {
    if (value === 'simple' || value === 'tradingview') {
      setChartType(value)
    }
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Toggle */}
      <div className='flex justify-start p-2 '>
        <ToggleGroup
          type='single'
          value={chartType}
          onValueChange={handleChartTypeChange}
        >
          <ToggleGroupItem
            variant='outline'
            value='simple'
            className='h-8 text-sm'
          >
            <ChartLine className='h-4 w-4' />
            Simple
          </ToggleGroupItem>
          <ToggleGroupItem
            variant='outline'
            value='tradingview'
            className='h-8 text-sm '
          >
            <ChartCandlestick className='h-4 w-4' />
            TradingView
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Chart Content */}
      <div className='flex-1'>
        {chartType === 'simple' ? (
          <div className='h-full w-full bg-muted/20 flex items-center justify-center'>
            {/* Здесь будет твой обычный график */}
            <div className='text-center text-muted-foreground'>
              <ChartLine className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p>Simple chart placeholder</p>
              <p className='text-sm'>Replace with your chart component</p>
            </div>
          </div>
        ) : (
          <iframe
            className='w-full h-full'
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=${theme}&style=3&hide_side_toolbar=false&autosize=true`}
          />
        )}
      </div>
    </div>
  )
}
