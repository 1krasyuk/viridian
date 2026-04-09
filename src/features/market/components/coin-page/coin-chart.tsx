import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { ChartLine, ChartCandlestick, Activity } from 'lucide-react'
import type { CoinChart } from '../../types/coin-chart'
import type { IChartApi, MouseEventParams, Time } from 'lightweight-charts'
import type { SeriesApiRef } from 'lightweight-charts-react-components'
import {
  AreaSeries,
  BaselineSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
  LineSeries,
} from 'lightweight-charts-react-components'
import {
  getChartColors,
  createChartOptions,
  createAreaSeriesOptions,
  createBaselineSeriesOptions,
  createBaseLineOptions,
  getLineColor,
} from '@/shared/lib/chart-config'

type ChartType = 'simple' | 'baseline' | 'tradingview'

const CHART_TYPE_KEY = 'coin-chart-type'

type TooltipState = {
  x: number
  y: number
  date: string
  time: string
  value: number
} | null

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
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const chartApiRef = useRef<IChartApi | null>(null)

  const areaSeriesRef = useRef<SeriesApiRef<'Area'> | null>(null)
  const baselineSeriesRef = useRef<SeriesApiRef<'Baseline'> | null>(null)

  const handleChartTypeChange = (value: string) => {
    if (value === 'simple' || value === 'baseline' || value === 'tradingview') {
      setChartType(value)
      localStorage.setItem(CHART_TYPE_KEY, value)
    }
  }

  const handleInit = (chart: IChartApi) => {
    chartApiRef.current = chart
  }

  const handleCrosshairMove = (param: MouseEventParams<Time>) => {
    if (!param.point || !param.time) {
      setTooltip(null)
      return
    }

    const series =
      chartType === 'simple' ? areaSeriesRef.current : baselineSeriesRef.current

    if (!series?._series) return

    const data = param.seriesData.get(series._series)

    if (!data || !('value' in data)) {
      setTooltip(null)
      return
    }

    const time = new Date(Number(param.time) * 1000)

    const price = data.value

    setTooltip({
      x: param.point.x,
      y: param.point.y,
      date: time.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      value: price,
    })
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
  const areaSeriesOptions = createAreaSeriesOptions(colors, chart.prices)

  const baseValue = useMemo(() => {
    if (!chart.prices.length) return 0
    return chart.prices[0].value
  }, [chart.prices])

  const baseLineData = useMemo(() => {
    if (!chart.prices.length) return []

    const firstTime = chart.prices[0].time
    const lastTime = chart.prices[chart.prices.length - 1].time

    return [
      { time: firstTime, value: baseValue },
      { time: lastTime, value: baseValue },
    ]
  }, [chart.prices, baseValue])

  const baseLineOptions = createBaseLineOptions(colors)

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
        {tooltip && (
          <div
            className='absolute z-50 pointer-events-none bg-muted border rounded-sm px-3 py-2 text-xs shadow-md min-w-50'
            style={{
              left: tooltip.x + 12,
              top: tooltip.y + 12,
            }}
          >
            {/* TOP ROW: date + time */}
            <div className='flex items-center justify-between mb-2'>
              <div className='font-bold text-xs text-sidebar-foreground'>
                {tooltip.date}
              </div>
              <div className='text-muted-foreground font-semibold text-xs'>
                {tooltip.time}
              </div>
            </div>

            {/* PRICE ROW */}
            <div className='flex gap-2 text-sm'>
              <div className='flex items-center gap-1'>
                <span
                  className={`w-2 h-2 rounded-full ${
                    chartType === 'simple'
                      ? (() => {
                          const lineColor = getLineColor(chart.prices, colors)
                          return lineColor === colors.positive
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                        })()
                      : tooltip.value >= baseValue
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                  }`}
                />
                <span className='font-semibold text-muted-foreground'>
                  Price:
                </span>
              </div>

              <div className='font-bold '>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(tooltip.value)}
              </div>
            </div>
          </div>
        )}

        {chartType === 'simple' ? (
          <Chart
            key={`simple-${resizeKey}`}
            containerProps={{
              className: 'absolute inset-0 w-full h-full min-w-0',
            }}
            options={chartOptions}
            onInit={handleInit}
            onCrosshairMove={handleCrosshairMove}
          >
            <AreaSeries
              ref={areaSeriesRef}
              data={chart.prices}
              options={areaSeriesOptions}
            />
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[chart.prices, theme, chartType, resizeKey]}
              />
            </TimeScale>
          </Chart>
        ) : chartType === 'baseline' ? (
          <Chart
            key={`baseline-${resizeKey}`}
            options={chartOptions}
            containerProps={{
              className: 'absolute inset-0',
            }}
            onInit={handleInit}
            onCrosshairMove={handleCrosshairMove}
          >
            <BaselineSeries
              ref={baselineSeriesRef}
              data={chart.prices}
              options={baselineSeriesOptions}
            />
            <LineSeries data={baseLineData} options={baseLineOptions} />
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
