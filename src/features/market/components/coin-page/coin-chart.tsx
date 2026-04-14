import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { ChartLine, ChartCandlestick, Activity, BarChart2 } from 'lucide-react'
import type { CoinChart } from '../../types/coin-chart'
import type { IChartApi, MouseEventParams, Time } from 'lightweight-charts'
import type { SeriesApiRef } from 'lightweight-charts-react-components'
import {
  AreaSeries,
  BaselineSeries,
  LineSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from 'lightweight-charts-react-components'
import {
  getChartColors,
  createChartOptions,
  createAreaSeriesOptions,
  createBaselineSeriesOptions,
  createBaseLineOptions,
  createLineSeriesOptions,
  getLineColor,
} from '@/shared/lib/chart-config'

type ChartType = 'simple' | 'baseline' | 'tradingview'
type DataType = 'price' | 'marketCap'

const CHART_TYPE_KEY = 'coin-chart-type'

type TooltipState = {
  x: number
  y: number
  date: string
  time: string
  value: number
  volume: number
} | null

export function CoinChart({
  symbol,
  chart,
  days,
  onDaysChange,
  dataType,
  onDataTypeChange,
}: {
  symbol: string | undefined
  chart: CoinChart
  days: string
  onDaysChange: (v: string) => void
  dataType: 'price' | 'marketCap'
  onDataTypeChange: (v: 'price' | 'marketCap') => void
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
  const lineSeriesRef = useRef<SeriesApiRef<'Line'> | null>(null)

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

    // Выбираем правильный реф в зависимости от chartType И dataType
    let seriesApi = null

    if (chartType === 'simple') {
      seriesApi =
        dataType === 'price'
          ? areaSeriesRef.current?._series
          : lineSeriesRef.current?._series
    } else if (chartType === 'baseline') {
      seriesApi =
        dataType === 'price'
          ? baselineSeriesRef.current?._series
          : lineSeriesRef.current?._series
    }

    if (!seriesApi) return

    const data = param.seriesData.get(seriesApi)

    if (!data || !('value' in data)) {
      setTooltip(null)
      return
    }

    const time = new Date(Number(param.time) * 1000)
    const value = data.value
    const volumeData = chart.total_volumes.find(
      (v) => v.time === Number(param.time),
    )

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
      value: value,
      volume: volumeData?.value ?? 0,
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
  const chartOptions = createChartOptions(colors, days)
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
  const lineSeriesOptions = createLineSeriesOptions(
    colors,
    dataType === 'marketCap',
  )

  const [ytdDays] = useState(() => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const diffTime = now.getTime() - startOfYear.getTime()
    return String(Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  })

  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-between p-2'>
        <ToggleGroup
          type='single'
          value={dataType}
          onValueChange={(v) => v && onDataTypeChange(v as DataType)}
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

        <ToggleGroup
          type='single'
          value={days}
          onValueChange={(v) => v && onDaysChange(v)}
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
          <ToggleGroupItem value={ytdDays} variant='outline'>
            YTD
          </ToggleGroupItem>
          <ToggleGroupItem value='365' variant='outline'>
            1Y
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='flex-1 min-h-0 relative min-w-0 ' ref={containerRef}>
        {tooltip && (
          <div
            className='absolute z-50 pointer-events-none bg-card border rounded-sm px-3 py-2 text-xs shadow-md min-w-50'
            style={{
              left: `clamp(12px, ${tooltip.x + 12}px, calc(100% - 212px))`,
              top: `clamp(12px, ${tooltip.y + 12}px, calc(100% - 80px))`,
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

            {/* DATA ROW */}
            <div className='flex items-center gap-2 text-sm mb-1'>
              <span
                className={`w-2 h-2 rounded-full ${
                  dataType === 'marketCap'
                    ? 'bg-blue-500'
                    : chartType === 'simple'
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
                {dataType === 'price' ? 'Price:' : 'Market Cap:'}
              </span>
              <span className='font-bold'>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: dataType === 'marketCap' ? 'compact' : undefined,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(tooltip.value)}
              </span>
            </div>

            {/* VOLUME ROW */}
            <div className='flex items-center gap-1.5 text-sm'>
              <BarChart2 className='w-3 h-3 text-muted-foreground' />
              <span className='font-semibold text-muted-foreground'>
                Volume:
              </span>
              <span className='font-bold'>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 2,
                }).format(tooltip.volume)}
              </span>
            </div>
          </div>
        )}

        {chartType === 'simple' ? (
          <Chart
            key={`simple-${resizeKey}-${dataType}`}
            containerProps={{
              className: 'absolute inset-0 w-full h-full min-w-0',
            }}
            options={chartOptions}
            onInit={handleInit}
            onCrosshairMove={handleCrosshairMove}
          >
            {dataType === 'price' ? (
              <AreaSeries
                ref={areaSeriesRef}
                data={chart.prices}
                options={areaSeriesOptions}
              />
            ) : (
              <LineSeries
                ref={lineSeriesRef}
                data={chart.market_caps}
                options={lineSeriesOptions}
              />
            )}
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[
                  chart.prices,
                  chart.market_caps,
                  theme,
                  chartType,
                  dataType,
                  resizeKey,
                ]}
              />
            </TimeScale>
          </Chart>
        ) : chartType === 'baseline' ? (
          <Chart
            key={`baseline-${resizeKey}-${dataType}`}
            options={chartOptions}
            containerProps={{
              className: 'absolute inset-0',
            }}
            onInit={handleInit}
            onCrosshairMove={handleCrosshairMove}
          >
            {dataType === 'price' ? (
              <>
                <BaselineSeries
                  ref={baselineSeriesRef}
                  data={chart.prices}
                  options={baselineSeriesOptions}
                />
                <LineSeries data={baseLineData} options={baseLineOptions} />
              </>
            ) : (
              <LineSeries
                ref={lineSeriesRef}
                data={chart.market_caps}
                options={lineSeriesOptions}
              />
            )}
            <TimeScale>
              <TimeScaleFitContentTrigger
                deps={[
                  chart.prices,
                  chart.market_caps,
                  theme,
                  chartType,
                  dataType,
                  resizeKey,
                ]}
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
