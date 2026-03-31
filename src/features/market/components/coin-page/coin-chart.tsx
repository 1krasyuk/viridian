import { useState } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { ChartLine, ChartCandlestick } from 'lucide-react'
import type { CoinChart } from '../../types/coin-chart'
import {
  AreaSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from 'lightweight-charts-react-components'
import {
  getChartColors,
  createChartOptions,
  createAreaSeriesOptions,
} from '@/shared/lib/chart-config'

export function CoinChart({
  symbol,
  chart,
}: {
  symbol: string | undefined
  chart: CoinChart
}) {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<'simple' | 'tradingview'>('simple')

  const handleChartTypeChange = (value: string) => {
    if (value === 'simple' || value === 'tradingview') {
      setChartType(value)
    }
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = getChartColors(isDark)
  const chartOptions = createChartOptions(colors)
  const areaSeriesOptions = createAreaSeriesOptions(colors)

  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-start p-2'>
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
            className='h-8 text-sm'
          >
            <ChartCandlestick className='h-4 w-4' />
            TradingView
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='flex-1'>
        {chartType === 'simple' ? (
          <div className='h-full w-full flex items-center justify-center'>
            <Chart
              containerProps={{ className: 'w-full h-full' }}
              options={chartOptions}
            >
              <AreaSeries data={chart.prices} options={areaSeriesOptions} />
              <TimeScale>
                <TimeScaleFitContentTrigger deps={[chart.prices, theme]} />
              </TimeScale>
            </Chart>
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
