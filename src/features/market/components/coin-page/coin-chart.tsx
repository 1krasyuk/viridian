import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { ChartLine, ChartCandlestick, Activity } from 'lucide-react'
import type { CoinChart } from '../../types/coin-chart'
import {
  AreaSeries,
  BaselineSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from 'lightweight-charts-react-components'
import {
  getChartColors,
  createChartOptions,
  createAreaSeriesOptions,
  createBaselineSeriesOptions,
} from '@/shared/lib/chart-config'

type ChartType = 'simple' | 'baseline' | 'tradingview'

const CHART_TYPE_KEY = 'coin-chart-type'

export function CoinChart({
  symbol,
  chart,
}: {
  symbol: string | undefined
  chart: CoinChart
}) {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<ChartType>(() => {
    const saved = localStorage.getItem(CHART_TYPE_KEY) as ChartType | null
    return saved && ['simple', 'baseline', 'tradingview'].includes(saved)
      ? saved
      : 'simple'
  })
  const [resizeKey, setResizeKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleChartTypeChange = (value: string) => {
    if (value === 'simple' || value === 'baseline' || value === 'tradingview') {
      setChartType(value)
      localStorage.setItem(CHART_TYPE_KEY, value)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      setResizeKey((prev) => prev + 1)
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

  const baseValue = useMemo(() => {
    if (chart.prices.length === 0) return 0
    return chart.prices[0].value
  }, [chart.prices])

  const baselineSeriesOptions = createBaselineSeriesOptions(colors, baseValue)

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
            value='baseline'
            className='h-8 text-sm'
          >
            <Activity className='h-4 w-4' />
            Baseline
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
      <div className='flex-1 min-h-0 relative min-w-0' ref={containerRef}>
        {chartType === 'simple' ? (
          <Chart
            key={`simple-${resizeKey}`}
            containerProps={{
              className: 'absolute inset-0 w-full h-full min-w-0',
            }}
            options={chartOptions}
          >
            <AreaSeries data={chart.prices} options={areaSeriesOptions} />
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[chart.prices, theme, chartType, resizeKey]}
              />
            </TimeScale>
          </Chart>
        ) : chartType === 'baseline' ? (
          <Chart
            key={`baseline-${resizeKey}`}
            containerProps={{
              className: 'absolute inset-0 w-full h-full min-w-0',
            }}
            options={chartOptions}
          >
            <BaselineSeries
              data={chart.prices}
              options={baselineSeriesOptions}
            />
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[chart.prices, theme, chartType, resizeKey]}
              />
            </TimeScale>
          </Chart>
        ) : (
          <iframe
            key={`tradingview-${resizeKey}`}
            className='w-full h-full'
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=${theme}&style=3&hide_side_toolbar=false&autosize=true`}
          />
        )}
      </div>
    </div>
  )
}
