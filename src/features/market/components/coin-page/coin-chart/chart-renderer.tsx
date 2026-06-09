import type { MouseEventParams, OhlcData, Time } from 'lightweight-charts'
import type { RefObject } from 'react'
import type { SeriesApiRef } from 'lightweight-charts-react-components'
import {
  AreaSeries,
  BaselineSeries,
  CandlestickSeries,
  Chart,
  LineSeries,
  TimeScale,
  TimeScaleFitContentTrigger,
} from 'lightweight-charts-react-components'
import type { CoinChart } from '@/features/market/types/coin-chart'
import type {
  createAreaSeriesOptions,
  createBaseLineOptions,
  createBaselineSeriesOptions,
  createCandlestickSeriesOptions,
  createChartOptions,
  createLineSeriesOptions,
} from '@/shared/lib/chart-config'
import type { IChartApi } from 'lightweight-charts'
import type { CoinChartDataType, CoinChartMode } from './types'

type CoinChartRendererProps = {
  chartMode: CoinChartMode
  view: 'classic' | 'terminal'
  dataType: CoinChartDataType
  days: string
  resizeKey: number
  symbol: string | undefined
  theme: string | undefined
  prices: CoinChart['prices']
  marketCaps: CoinChart['market_caps']
  baseLineData: CoinChart['prices']
  ohlcData: OhlcData[] | undefined
  hasOHLC: boolean
  chartOptions: ReturnType<typeof createChartOptions>
  areaSeriesOptions: ReturnType<typeof createAreaSeriesOptions>
  baselineSeriesOptions: ReturnType<typeof createBaselineSeriesOptions>
  baseLineOptions: ReturnType<typeof createBaseLineOptions>
  lineSeriesOptions: ReturnType<typeof createLineSeriesOptions>
  candlestickSeriesOptions: ReturnType<typeof createCandlestickSeriesOptions>
  onInit: (chart: IChartApi) => void
  onCrosshairMove: (param: MouseEventParams<Time>) => void
  areaSeriesRef: RefObject<SeriesApiRef<'Area'> | null>
  baselineSeriesRef: RefObject<SeriesApiRef<'Baseline'> | null>
  lineSeriesRef: RefObject<SeriesApiRef<'Line'> | null>
  candlestickSeriesRef: RefObject<SeriesApiRef<'Candlestick'> | null>
  baseLineSeriesRef: RefObject<SeriesApiRef<'Line'> | null>
}

export function CoinChartRenderer({
  chartMode,
  view,
  dataType,
  days,
  resizeKey,
  symbol,
  theme,
  prices,
  marketCaps,
  baseLineData,
  ohlcData,
  hasOHLC,
  chartOptions,
  areaSeriesOptions,
  baselineSeriesOptions,
  baseLineOptions,
  lineSeriesOptions,
  candlestickSeriesOptions,
  onInit,
  onCrosshairMove,
  areaSeriesRef,
  baselineSeriesRef,
  lineSeriesRef,
  candlestickSeriesRef,
  baseLineSeriesRef,
}: CoinChartRendererProps) {
  if (chartMode === 'candles' && hasOHLC) {
    return (
      <Chart
        key={`candles-${resizeKey}-${days}`}
        containerProps={{
          className: 'absolute inset-0 w-full h-full min-w-0',
        }}
        options={chartOptions}
        onInit={onInit}
        onCrosshairMove={onCrosshairMove}
      >
        <CandlestickSeries
          ref={candlestickSeriesRef}
          data={ohlcData ?? []}
          options={candlestickSeriesOptions}
        />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[ohlcData, resizeKey]} />
        </TimeScale>
      </Chart>
    )
  }

  if (chartMode === 'line' && view === 'classic') {
    return (
      <Chart
        key={`classic-${resizeKey}-${dataType}`}
        containerProps={{
          className: 'absolute inset-0 w-full h-full min-w-0',
        }}
        options={chartOptions}
        onInit={onInit}
        onCrosshairMove={onCrosshairMove}
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
          <TimeScaleFitContentTrigger deps={[prices, marketCaps, resizeKey]} />
        </TimeScale>
      </Chart>
    )
  }

  if (chartMode === 'line') {
    return (
      <Chart
        key={`terminal-${resizeKey}-${dataType}-${days}`}
        options={chartOptions}
        containerProps={{ className: 'absolute inset-0' }}
        onInit={onInit}
        onCrosshairMove={onCrosshairMove}
      >
        {dataType === 'price' ? (
          <>
            <BaselineSeries
              ref={baselineSeriesRef}
              data={prices}
              options={baselineSeriesOptions}
            />
            <LineSeries
              ref={baseLineSeriesRef}
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
          <TimeScaleFitContentTrigger deps={[prices, resizeKey]} />
        </TimeScale>
      </Chart>
    )
  }

  return (
    <iframe
      key={`tradingview-${resizeKey}`}
      className='w-full h-full'
      src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=${theme}&style=3&hide_side_toolbar=false&autosize=true`}
    />
  )
}
