import { CoinChart } from './coin-chart'
import { CoinDescription } from './coin-description'
import { CoinMarketDominance } from './coin-market-dominance'
import { CoinMarketScenarios } from './coin-market-scenarios'
import { CoinPriceChange } from './coin-price-change'
import { CoinRiskMetrics } from './coin-risk-metrics'
import { CoinRoiCalculator } from './coin-roi-calculator'
import { CoinTickersTable } from './coin-tickers-table'
import { CoinTokenomics } from './coin-tokenomics'
import { CoinConverter } from './coin-overview/coin-converter'
import { CoinHeader } from './coin-overview/coin-header'
import { CoinInfo } from './coin-overview/coin-info'
import { CoinPricePerformance } from './coin-overview/coin-price-perfomance'
import { CoinSentiment } from './coin-overview/coin-sentiment'
import { CoinStatistics } from './coin-overview/coin-statistics'
import type { Coin } from '@/features/market/types/coin'
import type { CoinChart as CoinChartData } from '@/features/market/types/coin-chart'
import type { GlobalData } from '@/features/market/types/global'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui/resizable'
import { CoinPageViewModeTabs } from './coin-page-view-mode-tabs'

type DataType = 'price' | 'marketCap'

type CoinPageSectionProps = {
  coinId: string
  coin: Coin | undefined
  chart?: CoinChartData
  days: string
  onDaysChange: (value: string) => void
  dataType: DataType
  onDataTypeChange: (value: DataType) => void
  isLoadingCoin: boolean
  isLoadingChart: boolean
}

type ClassicCoinPageContentProps = CoinPageSectionProps & {
  globalData?: GlobalData | null
  metricsChart?: CoinChartData
  metricDays: string
  onMetricDaysChange: (value: string) => void
  isLoadingMetrics: boolean
}

export function ClassicCoinPageContent({
  coinId,
  coin,
  chart,
  days,
  onDaysChange,
  dataType,
  onDataTypeChange,
  isLoadingCoin,
  isLoadingChart,
  globalData,
  metricsChart,
  metricDays,
  onMetricDaysChange,
  isLoadingMetrics,
}: ClassicCoinPageContentProps) {
  return (
    <div className='flex flex-col min-w-0'>
      <div className='h-105 min-w-0 relative w-full sm:h-130 xl:h-150'>
        <CoinChart
          coinId={coinId}
          chart={chart}
          symbol={coin?.symbol}
          days={days}
          onDaysChange={onDaysChange}
          dataType={dataType}
          onDataTypeChange={onDataTypeChange}
          isLoading={isLoadingChart}
          view='classic'
        />
      </div>
      <div className='flex flex-col gap-4 p-3 sm:gap-5 sm:p-5'>
        <CoinPriceChange coin={coin} isLoading={isLoadingCoin} />
        <CoinDescription
          description={coin?.description}
          isLoading={isLoadingCoin}
        />

        <div className='grid grid-cols-1 gap-4 items-stretch lg:grid-cols-2 lg:gap-5'>
          <CoinTokenomics coin={coin} isLoading={isLoadingCoin} />
          <CoinMarketDominance
            coin={coin}
            isLoading={isLoadingCoin}
            globalData={globalData}
          />
        </div>

        <div className='grid grid-cols-1 gap-5'>
          <CoinRiskMetrics
            coin={coin}
            chart={metricsChart}
            days={metricDays}
            onDaysChange={onMetricDaysChange}
            isLoadingCoin={isLoadingCoin}
            isLoadingChart={isLoadingMetrics}
          />
        </div>

        <CoinRoiCalculator coin={coin} isLoading={isLoadingCoin} />
        <CoinMarketScenarios coin={coin} isLoading={isLoadingCoin} />

        <CoinTickersTable
          coinName={coin?.name || ''}
          tickers={coin?.tickers ?? []}
          loading={isLoadingCoin}
          mode='pagination'
        />
      </div>
    </div>
  )
}

export function TerminalCoinPageContent({
  coinId,
  coin,
  chart,
  days,
  onDaysChange,
  dataType,
  onDataTypeChange,
  isLoadingCoin,
  isLoadingChart,
}: CoinPageSectionProps) {
  return (
    <>
      <div className='flex min-h-180 flex-col xl:hidden'>
        <div className='h-105 min-w-0 sm:h-130'>
          <CoinChart
            coinId={coinId}
            chart={chart}
            symbol={coin?.symbol}
            days={days}
            onDaysChange={onDaysChange}
            dataType={dataType}
            onDataTypeChange={onDataTypeChange}
            isLoading={isLoadingChart}
            view='terminal'
          />
        </div>
        <div className='min-h-0 flex-1 overflow-auto py-4'>
          <CoinTickersTable
            coinName={coin?.name || ''}
            tickers={coin?.tickers ?? []}
            loading={isLoadingCoin}
            mode='infinite'
          />
        </div>
      </div>
      <DesktopTerminalCoinPageContent
        coinId={coinId}
        coin={coin}
        chart={chart}
        days={days}
        onDaysChange={onDaysChange}
        dataType={dataType}
        onDataTypeChange={onDataTypeChange}
        isLoadingCoin={isLoadingCoin}
        isLoadingChart={isLoadingChart}
      />
    </>
  )
}

export function DesktopTerminalCoinPageContent(props: CoinPageSectionProps) {
  const {
    coinId,
    coin,
    chart,
    days,
    onDaysChange,
    dataType,
    onDataTypeChange,
    isLoadingCoin,
    isLoadingChart,
  } = props

  return (
    <ResizablePanelGroup orientation='vertical' className='hidden xl:flex'>
      <ResizablePanel
        defaultSize='70%'
        minSize='35%'
        className='min-h-0 min-w-0'
      >
        <div className='h-full min-h-0 min-w-0'>
          <CoinChart
            coinId={coinId}
            chart={chart}
            symbol={coin?.symbol}
            days={days}
            onDaysChange={onDaysChange}
            dataType={dataType}
            onDataTypeChange={onDataTypeChange}
            isLoading={isLoadingChart}
            view='terminal'
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize='30%' minSize='20%'>
        <div className='relative h-full overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30'>
          <div className='py-5'>
            <CoinTickersTable
              coinName={coin?.name || ''}
              tickers={coin?.tickers ?? []}
              loading={isLoadingCoin}
              mode='infinite'
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function CoinPageSidebar({
  coin,
  isLoading,
  days,
}: {
  coin: Coin | undefined
  isLoading: boolean
  days: string
}) {
  return (
    <aside className='order-first flex w-full flex-col border-b bg-background xl:order-last xl:sticky xl:top-0 xl:h-screen xl:w-90 xl:shrink-0 xl:border-b-0 xl:border-l 2xl:w-105'>
      <div className='bg-background px-3 pt-3 pb-4 relative sm:px-5 sm:pt-5 sm:pb-6'>
        <CoinHeader coin={coin} isLoading={isLoading} days={days} />
      </div>

      <div className='grid grid-cols-1 gap-3 px-3 pb-4 sm:grid-cols-2 sm:px-5 xl:flex xl:flex-1 xl:flex-col xl:overflow-y-auto xl:no-scrollbar xl:pb-5'>
        <CoinStatistics coin={coin} isLoading={isLoading} />
        <CoinInfo coin={coin} isLoading={isLoading} />
        <CoinSentiment coin={coin} isLoading={isLoading} />
        <CoinPricePerformance coin={coin} isLoading={isLoading} />
        <CoinConverter coin={coin} isLoading={isLoading} />
      </div>
    </aside>
  )
}

type MobileViewMode = 'pagination' | 'infinite'

type MobileCoinPageContentProps = CoinPageSectionProps & {
  globalData?: GlobalData | null
  metricsChart?: CoinChartData
  metricDays: string
  onMetricDaysChange: (value: string) => void
  isLoadingMetrics: boolean
  viewMode: MobileViewMode
  onViewModeChange: (value: MobileViewMode) => void
}

export function MobileCoinPageContent({
  coinId,
  coin,
  chart,
  days,
  onDaysChange,
  dataType,
  onDataTypeChange,
  isLoadingCoin,
  isLoadingChart,
  globalData,
  metricsChart,
  metricDays,
  onMetricDaysChange,
  isLoadingMetrics,
  viewMode,
  onViewModeChange,
}: MobileCoinPageContentProps) {
  return (
    <div className='flex flex-col min-w-0 h-dvh xl:hidden'>
      {/* Sticky Header + Tabs */}
      <div className='shrink-0 bg-background'>
        <div className='px-3 pt-3 pb-4 sm:px-5 sm:pt-5 sm:pb-6'>
          <CoinHeader coin={coin} isLoading={isLoadingCoin} days={days} />
        </div>
        <div>
          <CoinPageViewModeTabs
            value={viewMode}
            onValueChange={onViewModeChange}
          />
        </div>
      </div>

      {viewMode === 'pagination' ? (
        /* ===== CLASSIC MOBILE VIEW ===== */
        <div className='flex-1 overflow-auto'>
          {/* Chart */}
          <div className='h-105 p-4 min-w-0 relative w-full sm:h-130'>
            <CoinChart
              coinId={coinId}
              chart={chart}
              symbol={coin?.symbol}
              days={days}
              onDaysChange={onDaysChange}
              dataType={dataType}
              onDataTypeChange={onDataTypeChange}
              isLoading={isLoadingChart}
              view='classic'
            />
          </div>

          <div className='px-4 space-y-3'>
            <CoinPriceChange coin={coin} isLoading={isLoadingCoin} />
            <CoinConverter coin={coin} isLoading={isLoadingCoin} />
          </div>

          {/* Sidebar components */}
          <div className='p-4 grid grid-cols-1 gap-3'>
            <p className='font-bold text-base'>{coin?.name} statistics</p>
            <CoinStatistics coin={coin} isLoading={isLoadingCoin} />
            <CoinInfo coin={coin} isLoading={isLoadingCoin} />
            <CoinSentiment coin={coin} isLoading={isLoadingCoin} />
            <CoinPricePerformance coin={coin} isLoading={isLoadingCoin} />
          </div>

          {/* Content */}
          <div className='flex flex-col gap-4 p-3 sm:gap-5 sm:p-5'>
            <CoinDescription
              description={coin?.description}
              isLoading={isLoadingCoin}
            />

            <div className='grid grid-cols-1 gap-4'>
              <CoinTokenomics coin={coin} isLoading={isLoadingCoin} />
              <CoinMarketDominance
                coin={coin}
                isLoading={isLoadingCoin}
                globalData={globalData}
              />
            </div>

            <div className='grid grid-cols-1 gap-5'>
              <CoinRiskMetrics
                coin={coin}
                chart={metricsChart}
                days={metricDays}
                onDaysChange={onMetricDaysChange}
                isLoadingCoin={isLoadingCoin}
                isLoadingChart={isLoadingMetrics}
              />
            </div>

            <CoinRoiCalculator coin={coin} isLoading={isLoadingCoin} />
            <CoinMarketScenarios coin={coin} isLoading={isLoadingCoin} />

            {/* Markets — pagination */}
            <CoinTickersTable
              coinName={coin?.name || ''}
              tickers={coin?.tickers ?? []}
              loading={isLoadingCoin}
              mode='pagination'
            />
          </div>
        </div>
      ) : (
        /* ===== TERMINAL MOBILE VIEW ===== */
        <div className='flex-1 min-h-0'>
          <ResizablePanelGroup orientation='vertical' className='h-full'>
            <ResizablePanel defaultSize='60%' minSize='40%'>
              <div className='h-full min-h-0 p-4'>
                <CoinChart
                  coinId={coinId}
                  chart={chart}
                  symbol={coin?.symbol}
                  days={days}
                  onDaysChange={onDaysChange}
                  dataType={dataType}
                  onDataTypeChange={onDataTypeChange}
                  isLoading={isLoadingChart}
                  view='terminal'
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize='40%' minSize='20%'>
              <div className='relative h-full overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30'>
                <div className='py-4'>
                  <CoinTickersTable
                    coinName={coin?.name || ''}
                    tickers={coin?.tickers ?? []}
                    loading={isLoadingCoin}
                    mode='infinite'
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  )
}
