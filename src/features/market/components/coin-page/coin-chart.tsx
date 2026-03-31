import { useState, useRef, useEffect } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)

  const handleChartTypeChange = (value: string) => {
    if (value === 'simple' || value === 'tradingview') {
      setChartType(value)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      containerRef.current?.style.setProperty('opacity', '0.99')
      requestAnimationFrame(() => {
        containerRef.current?.style.setProperty('opacity', '1')
      })
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

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

      <div className='flex-1 min-h-0 relative min-w-0 ' ref={containerRef}>
        {chartType === 'simple' ? (
          <Chart
            containerProps={{
              className: 'absolute inset-0 w-full h-full min-w-0',
            }}
            options={chartOptions}
          >
            <AreaSeries data={chart.prices} options={areaSeriesOptions} />
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[chart.prices, theme, chartType]}
              />
            </TimeScale>
          </Chart>
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
