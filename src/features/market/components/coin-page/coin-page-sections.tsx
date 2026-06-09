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
      <div className='h-150 min-w-0 relative w-full'>
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
      <div className='flex flex-col p-5 gap-5'>
        <CoinPriceChange coin={coin} isLoading={isLoadingCoin} />
        <CoinDescription
          description={coin?.description}
          isLoading={isLoadingCoin}
        />

        <div className='grid xs:grid-cols-1 grid-cols-2 gap-5 items-stretch'>
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
    <ResizablePanelGroup orientation='vertical'>
      <ResizablePanel defaultSize='70%' minSize='35%' className='min-h-0 min-w-0'>
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
    <div className='min-w-1/4 sticky top-0 h-screen flex flex-col border-l'>
      <div className='bg-background px-5 pt-5 pb-6 relative'>
        <CoinHeader coin={coin} isLoading={isLoading} days={days} />
      </div>

      <div className='flex-1 overflow-y-auto no-scrollbar px-5 pb-5 flex flex-col gap-3'>
        <CoinStatistics coin={coin} isLoading={isLoading} />
        <CoinInfo coin={coin} isLoading={isLoading} />
        <CoinSentiment coin={coin} isLoading={isLoading} />
        <CoinPricePerformance coin={coin} isLoading={isLoading} />
        <CoinConverter coin={coin} isLoading={isLoading} />
      </div>
    </div>
  )
}
