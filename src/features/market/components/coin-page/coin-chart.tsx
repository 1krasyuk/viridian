import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTheme } from '@/shared/lib/theme-provider'
import type { CoinChart as CoinChartData } from '../../types/coin-chart'
import type {
  IChartApi,
  MouseEventParams,
  Time,
  UTCTimestamp,
} from 'lightweight-charts'
import type { SeriesApiRef } from 'lightweight-charts-react-components'
import {
  getChartColors,
  createChartOptions,
  createAreaSeriesOptions,
  createBaselineSeriesOptions,
  createBaseLineOptions,
  createLineSeriesOptions,
  createCandlestickSeriesOptions,
} from '@/shared/lib/chart-config'
import { Loader2 } from 'lucide-react'
import { useCoinCurrentPrice, useCoinOHLC } from '../../hooks/coins-queries'
import { CoinChartControls } from './coin-chart/chart-controls'
import { CoinChartTooltip } from './coin-chart/chart-tooltip'
import type {
  CoinChartDataType,
  CoinChartTooltipState,
  CoinChartVolumePoint,
} from './coin-chart/types'
import { useChartMode } from './coin-chart/use-chart-mode'
import { useChartFullscreen } from './coin-chart/use-chart-fullscreen'
import { useResizeKey } from './coin-chart/use-resize-key'
import { downloadChartImage } from './coin-chart/download-chart'
import { CoinChartRenderer } from './coin-chart/chart-renderer'

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
  chart?: CoinChartData
  days: string
  onDaysChange: (v: string) => void
  dataType: CoinChartDataType
  onDataTypeChange: (v: CoinChartDataType) => void
  isLoading?: boolean
  view: 'classic' | 'terminal'
}) {
  const { theme } = useTheme()

  const [chartMode, setChartMode] = useChartMode()

  const { data: currentPrice } = useCoinCurrentPrice(
    coinId,
    view === 'terminal',
  )
  const { data: ohlcData } = useCoinOHLC(coinId, days, chartMode === 'candles')

  const [tooltip, setTooltip] = useState<CoinChartTooltipState>(null)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartApiRef = useRef<IChartApi | null>(null)
  const { resizeKey, bumpResizeKey } = useResizeKey(containerRef)
  const handleFullscreenResize = useCallback(() => bumpResizeKey(), [
    bumpResizeKey,
  ])
  const { isFullscreen, toggleFullscreen } = useChartFullscreen(
    wrapperRef,
    handleFullscreenResize,
  )

  const areaSeriesRef = useRef<SeriesApiRef<'Area'> | null>(null)
  const baselineSeriesRef = useRef<SeriesApiRef<'Baseline'> | null>(null)
  const lineSeriesRef = useRef<SeriesApiRef<'Line'> | null>(null)
  const candlestickSeriesRef = useRef<SeriesApiRef<'Candlestick'> | null>(null)
  const baseLineSeriesRef = useRef<SeriesApiRef<'Line'> | null>(null)
  const realtimeVolumesRef = useRef<CoinChartVolumePoint[]>([])

  const handleInit = (chart: IChartApi) => {
    chartApiRef.current = chart
  }

  const handleCrosshairMove = (param: MouseEventParams<Time>) => {
    if (!param.point || !param.time) {
      setTooltip(null)
      return
    }

    const seriesApi =
      chartMode === 'candles'
        ? candlestickSeriesRef.current?._series
        : view === 'classic'
          ? dataType === 'price'
            ? areaSeriesRef.current?._series
            : lineSeriesRef.current?._series
          : dataType === 'price'
            ? baselineSeriesRef.current?._series
            : lineSeriesRef.current?._series

    if (!seriesApi) {
      setTooltip(null)
      return
    }

    const data = param.seriesData.get(seriesApi)
    if (!data) {
      setTooltip(null)
      return
    }

    const time = new Date(Number(param.time) * 1000)
    const paramTime = Number(param.time)

    let volume = chart?.total_volumes?.find((v) => v.time === paramTime)?.value

    if (volume == null) {
      const realtimeVolume = realtimeVolumesRef.current.find(
        (v) => v.time === paramTime,
      )
      if (realtimeVolume) {
        volume = realtimeVolume.value
      }
    }

    if (volume == null) {
      const lastRealtime = realtimeVolumesRef.current.at(-1)
      if (lastRealtime) {
        volume = lastRealtime.value
      }
    }

    volume ??= 0

    const newTooltip: CoinChartTooltipState =
      chartMode === 'candles' && 'open' in data
        ? {
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
          value: data.close,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume,
        }
        : 'value' in data
          ? {
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
            value: data.value,
            volume,
          }
          : null

    if (JSON.stringify(newTooltip) !== JSON.stringify(tooltip)) {
      setTooltip(newTooltip)
    }
  }

  const prices = useMemo(() => chart?.prices ?? [], [chart])
  const marketCaps = useMemo(() => chart?.market_caps ?? [], [chart])
  const baseValue = prices[0]?.value ?? 0

  useEffect(() => {
    if (
      !currentPrice ||
      view !== 'terminal' ||
      chartMode === 'candles' ||
      dataType !== 'price'
    )
      return

    const newTime = Math.floor(Date.now() / 1000) as UTCTimestamp
    const newPoint = { time: newTime, value: currentPrice.price }

    baselineSeriesRef.current?._series?.update(newPoint)

    realtimeVolumesRef.current.push({
      time: newTime,
      value: currentPrice.volume,
    })

    if (realtimeVolumesRef.current.length > 1000) {
      realtimeVolumesRef.current = realtimeVolumesRef.current.slice(-1000)
    }

    if (baseLineSeriesRef.current?._series && prices.length > 0) {
      const firstTime = prices[0].time
      baseLineSeriesRef.current._series.setData([
        { time: firstTime, value: baseValue },
        { time: newTime, value: baseValue },
      ])
    }
  }, [currentPrice, view, chartMode, dataType, baseValue, prices])

  useEffect(() => {
    realtimeVolumesRef.current = []
  }, [coinId, days])

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = getChartColors(isDark)
  const chartOptions = createChartOptions(colors, days)
  const areaSeriesOptions = createAreaSeriesOptions(colors, prices)
  const baselineSeriesOptions = createBaselineSeriesOptions(colors, baseValue)
  const baseLineOptions = createBaseLineOptions(colors)
  const lineSeriesOptions = createLineSeriesOptions(
    colors,
    dataType === 'marketCap',
  )
  const candlestickSeriesOptions = createCandlestickSeriesOptions(colors)

  const baseLineData = useMemo(() => {
    if (!prices.length) return []
    return [
      { time: prices[0].time, value: baseValue },
      { time: prices[prices.length - 1].time, value: baseValue },
    ]
  }, [prices, baseValue])

  const [ytdDays] = useState(() => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const diffTime = now.getTime() - startOfYear.getTime()
    return String(Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  })

  useEffect(() => {
    if (chartMode === 'candles' && days === ytdDays) {
      onDaysChange('180')
    } else if (chartMode !== 'candles' && days === '180') {
      onDaysChange(ytdDays)
    }
  }, [chartMode, days, onDaysChange, ytdDays])

  const downloadChart = () => {
    downloadChartImage({
      chartApi: chartApiRef.current,
      days,
      ytdDays,
      symbol,
      chartMode,
      isDark,
    })
  }

  const hasData = !isLoading && !!chart && prices.length > 0
  const hasOHLC = !!ohlcData && ohlcData.length > 0

  return (
    <div ref={wrapperRef} className='flex flex-col h-full bg-background'>
      <CoinChartControls
        dataType={dataType}
        onDataTypeChange={onDataTypeChange}
        chartMode={chartMode}
        onChartModeChange={setChartMode}
        days={days}
        ytdDays={ytdDays}
        onDaysChange={onDaysChange}
        onDownload={downloadChart}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        isLoading={isLoading}
      />

      {/* Chart Container */}
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
            <CoinChartTooltip
              tooltip={tooltip}
              chartMode={chartMode}
              dataType={dataType}
              view={view}
              prices={prices}
              colors={colors}
              baseValue={baseValue}
            />

            <CoinChartRenderer
              chartMode={chartMode}
              view={view}
              dataType={dataType}
              days={days}
              resizeKey={resizeKey}
              symbol={symbol}
              theme={theme}
              prices={prices}
              marketCaps={marketCaps}
              baseLineData={baseLineData}
              ohlcData={ohlcData}
              hasOHLC={hasOHLC}
              chartOptions={chartOptions}
              areaSeriesOptions={areaSeriesOptions}
              baselineSeriesOptions={baselineSeriesOptions}
              baseLineOptions={baseLineOptions}
              lineSeriesOptions={lineSeriesOptions}
              candlestickSeriesOptions={candlestickSeriesOptions}
              onInit={handleInit}
              onCrosshairMove={handleCrosshairMove}
              areaSeriesRef={areaSeriesRef}
              baselineSeriesRef={baselineSeriesRef}
              lineSeriesRef={lineSeriesRef}
              candlestickSeriesRef={candlestickSeriesRef}
              baseLineSeriesRef={baseLineSeriesRef}
            />
          </>
        )}
      </div>
    </div>
  )
}
