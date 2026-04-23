import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import {
  ChartLine,
  ChartCandlestick,
  BarChart2,
  Maximize,
  Download,
  Minimize,
} from 'lucide-react'
import type { CoinChart } from '../../types/coin-chart'
import type {
  IChartApi,
  MouseEventParams,
  Time,
  UTCTimestamp,
} from 'lightweight-charts'
import type { SeriesApiRef } from 'lightweight-charts-react-components'
import {
  AreaSeries,
  BaselineSeries,
  LineSeries,
  CandlestickSeries,
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
  createCandlestickSeriesOptions,
  getLineColor,
} from '@/shared/lib/chart-config'
import { Button } from '@/shared/ui/button'
import { Loader2 } from 'lucide-react'
import { useCoinCurrentPrice, useCoinOHLC } from '../../hooks/coins-queries'

type DataType = 'price' | 'marketCap'
type ChartMode = 'classic' | 'candles' | 'tradingview'

const CHART_MODE_KEY = 'coin-chart-mode'

type TooltipState = {
  x: number
  y: number
  date: string
  time: string
  value: number
  volume: number
} | null

export function CoinChart({
  coinId,
  symbol,
  chart,
  days,
  onDaysChange,
  dataType,
  onDataTypeChange,
  isLoading,
  view,
}: {
  coinId: string
  symbol: string | undefined
  chart?: CoinChart
  days: string
  onDaysChange: (v: string) => void
  dataType: 'price' | 'marketCap'
  onDataTypeChange: (v: 'price' | 'marketCap') => void
  isLoading?: boolean
  view: 'classic' | 'terminal'
}) {
  const { theme } = useTheme()

  const [chartMode, setChartMode] = useState<ChartMode>(() => {
    const saved = localStorage.getItem(CHART_MODE_KEY) as ChartMode | null
    return saved && ['classic', 'candles', 'tradingview'].includes(saved)
      ? saved
      : 'classic'
  })

  const { data: currentPrice } = useCoinCurrentPrice(
    coinId,
    view === 'terminal',
  )

  const { data: ohlcData } = useCoinOHLC(coinId, days, chartMode === 'candles')

  const [resizeKey, setResizeKey] = useState(0)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartApiRef = useRef<IChartApi | null>(null)

  const areaSeriesRef = useRef<SeriesApiRef<'Area'> | null>(null)
  const baselineSeriesRef = useRef<SeriesApiRef<'Baseline'> | null>(null)
  const lineSeriesRef = useRef<SeriesApiRef<'Line'> | null>(null)
  const candlestickSeriesRef = useRef<SeriesApiRef<'Candlestick'> | null>(null)

  const handleChartModeChange = (value: string) => {
    if (value === 'classic' || value === 'candles' || value === 'tradingview') {
      setChartMode(value)
      localStorage.setItem(CHART_MODE_KEY, value)
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

    let seriesApi = null

    if (chartMode === 'candles') {
      seriesApi = candlestickSeriesRef.current?._series
    } else if (view === 'classic') {
      seriesApi =
        dataType === 'price'
          ? areaSeriesRef.current?._series
          : lineSeriesRef.current?._series
    } else {
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
    const volumeData = chart?.total_volumes.find(
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

  useEffect(() => {
    const handler = () => {
      const fullscreen = !!document.fullscreenElement
      setIsFullscreen(fullscreen)
      setTimeout(() => setResizeKey((prev) => prev + 1), 100)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (!currentPrice || view !== 'terminal' || chartMode === 'candles') return

    const newPoint = {
      time: Math.floor(Date.now() / 1000) as UTCTimestamp,
      value: dataType === 'price' ? currentPrice.price : currentPrice.marketCap,
    }

    if (dataType === 'price') {
      if (view === 'terminal') {
        baselineSeriesRef.current?._series?.update(newPoint)
      } else {
        areaSeriesRef.current?._series?.update(newPoint)
      }
    } else {
      lineSeriesRef.current?._series?.update(newPoint)
    }
  }, [currentPrice, view, dataType, chartMode])

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const prices = useMemo(() => chart?.prices ?? [], [chart])
  const marketCaps = useMemo(() => chart?.market_caps ?? [], [chart])

  const colors = getChartColors(isDark)
  const chartOptions = createChartOptions(colors, days)
  const areaSeriesOptions = createAreaSeriesOptions(colors, prices)

  const baseValue = useMemo(() => {
    if (!prices.length) return 0
    return prices[0].value
  }, [prices])

  const baseLineData = useMemo(() => {
    if (!prices.length) return []

    const firstTime = prices[0].time
    const lastTime = prices[prices.length - 1].time

    return [
      { time: firstTime, value: baseValue },
      { time: lastTime, value: baseValue },
    ]
  }, [prices, baseValue])

  const baseLineOptions = createBaseLineOptions(colors)
  const baselineSeriesOptions = createBaselineSeriesOptions(colors, baseValue)
  const lineSeriesOptions = createLineSeriesOptions(
    colors,
    dataType === 'marketCap',
  )
  const candlestickSeriesOptions = createCandlestickSeriesOptions(colors)

  const [ytdDays] = useState(() => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const diffTime = now.getTime() - startOfYear.getTime()
    return String(Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  })

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current?.requestFullscreen()
    }
  }

  const downloadChart = () => {
    const chartApi = chartApiRef.current
    if (!chartApi) return

    const periodMap: Record<string, string> = {
      '1': '1d',
      '7': '7d',
      '30': '30d',
      '90': '90d',
      [ytdDays]: 'ytd',
      '365': '1y',
    }

    const period = periodMap[days] || `${days}d`
    const coin = (symbol || 'unknown').toLowerCase()

    const now = new Date()
    const date = now.toLocaleDateString('en-CA').replaceAll('-', '.')
    const time = now.toTimeString().slice(0, 5).replace(':', '.')

    const filename = `${coin}-${period}-chart-viridian Desktop ${date}-${time}.png`

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

  const hasData = !isLoading && !!chart && prices.length > 0
  const hasOHLC = !!ohlcData && ohlcData.length > 0

  return (
    <div ref={wrapperRef} className='flex flex-col h-full bg-background'>
      <div className='flex justify-between p-2'>
        <div className='flex gap-2'>
          <ToggleGroup
            type='single'
            value={dataType}
            onValueChange={(v) => v && onDataTypeChange(v as DataType)}
            disabled={isLoading || chartMode === 'candles'}
            className='[&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
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
            onValueChange={handleChartModeChange}
            disabled={isLoading}
            className='[&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
          >
            <ToggleGroupItem variant='outline' value='classic'>
              <ChartLine className='h-4 w-4' />
            </ToggleGroupItem>
            <ToggleGroupItem variant='outline' value='candles'>
              <ChartCandlestick className='h-4 w-4' />
            </ToggleGroupItem>
            <ToggleGroupItem variant='outline' value='tradingview'>
              <ChartCandlestick className='h-4 w-4' />
              TradingView
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className='flex gap-2'>
          <ToggleGroup
            type='single'
            value={days}
            onValueChange={(v) => v && onDaysChange(v)}
            disabled={isLoading}
            className='[&>button:first-child]:rounded-l-lg! [&>button:last-child]:rounded-r-lg!'
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

          <Button
            variant='outline'
            size='icon'
            onClick={downloadChart}
            disabled={chartMode !== 'classic' || isLoading}
          >
            <Download className='h-4 w-4' />
          </Button>

          <Button
            size='icon'
            variant='outline'
            onClick={toggleFullscreen}
            disabled={isLoading}
          >
            {isFullscreen ? (
              <Minimize className='h-4 w-4' />
            ) : (
              <Maximize className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      <div className='flex-1 min-h-0 relative min-w-0' ref={containerRef}>
        {!hasData ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
            <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
            <span className='text-sm text-muted-foreground font-medium'>
              Loading chart data...
            </span>
          </div>
        ) : (
          <>
            {tooltip && chartMode === 'classic' && (
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
                          ? (() => {
                              const lineColor = getLineColor(prices, colors)
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
                      notation:
                        dataType === 'marketCap' ? 'compact' : undefined,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(tooltip.value)}
                  </span>
                </div>

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

            {chartMode === 'candles' && hasOHLC ? (
              <Chart
                key={`candles-${resizeKey}-${days}`}
                containerProps={{
                  className: 'absolute inset-0 w-full h-full min-w-0',
                }}
                options={chartOptions}
                onInit={handleInit}
                onCrosshairMove={handleCrosshairMove}
              >
                <CandlestickSeries
                  ref={candlestickSeriesRef}
                  data={ohlcData}
                  options={candlestickSeriesOptions}
                />
                <TimeScale>
                  <TimeScaleFitContentTrigger
                    deps={[ohlcData, theme, chartMode, resizeKey]}
                  />
                </TimeScale>
              </Chart>
            ) : chartMode === 'classic' ? (
              view === 'classic' ? (
                <Chart
                  key={`classic-${resizeKey}-${dataType}`}
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
                      data={prices}
                      options={areaSeriesOptions}
                    />
                  ) : (
                    <LineSeries
                      ref={lineSeriesRef}
                      data={marketCaps}
                      options={lineSeriesOptions}
                    />
                  )}
                  <TimeScale>
                    <TimeScaleFitContentTrigger
                      deps={[
                        prices,
                        marketCaps,
                        theme,
                        view,
                        dataType,
                        resizeKey,
                      ]}
                    />
                  </TimeScale>
                </Chart>
              ) : (
                <Chart
                  key={`terminal-${resizeKey}-${dataType}`}
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
                        data={prices}
                        options={baselineSeriesOptions}
                      />
                      <LineSeries
                        data={baseLineData}
                        options={baseLineOptions}
                      />
                    </>
                  ) : (
                    <LineSeries
                      ref={lineSeriesRef}
                      data={marketCaps}
                      options={lineSeriesOptions}
                    />
                  )}
                  <TimeScale>
                    <TimeScaleFitContentTrigger
                      deps={[
                        prices,
                        marketCaps,
                        theme,
                        view,
                        dataType,
                        resizeKey,
                      ]}
                    />
                  </TimeScale>
                </Chart>
              )
            ) : (
              <iframe
                key={`tradingview-${resizeKey}`}
                className='w-full h-full'
                src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=${theme}&style=3&hide_side_toolbar=false&autosize=true`}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
