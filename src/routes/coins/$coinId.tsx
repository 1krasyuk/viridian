import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useCoin,
  useCoinChart,
  useGlobalData,
} from '@/features/market/hooks/coins-queries' // ← добавлен useGlobalData
import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { CoinConverter } from '@/features/market/components/coin-page/coin-overview/coin-converter'
import { CoinDescription } from '@/features/market/components/coin-page/coin-description'
import { CoinHeader } from '@/features/market/components/coin-page/coin-overview/coin-header'
import { CoinInfo } from '@/features/market/components/coin-page/coin-overview/coin-info'
import { CoinPricePerformance } from '@/features/market/components/coin-page/coin-overview/coin-price-perfomance'
import { CoinSentiment } from '@/features/market/components/coin-page/coin-overview/coin-sentiment'
import { CoinStatistics } from '@/features/market/components/coin-page/coin-overview/coin-statistics'
import { CoinTickersTable } from '@/features/market/components/coin-page/coin-tickers-table'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui/resizable'
import { LayoutGrid, TerminalSquare } from 'lucide-react'
import { CoinPriceChange } from '@/features/market/components/coin-page/coin-price-change'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { CoinRiskMetrics } from '@/features/market/components/coin-page/coin-risk-metrics'
import { CoinTokenomics } from '@/features/market/components/coin-page/coin-tokenomics'
import { CoinMarketDominance } from '@/features/market/components/coin-page/coin-market-dominance'
import { CoinRoiCalculator } from '@/features/market/components/coin-page/coin-roi-calculator'
import { CoinMarketScenarios } from '@/features/market/components/coin-page/coin-market-scenarios'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading: isLoadingCoin } = useCoin(coinId)
  const { data: globalData } = useGlobalData()
  const [days, setDays] = useState('1')
  const [metricDays, setMetricDays] = useState('30')
  const { data: metricsChart, isLoading: isLoadingMetrics } = useCoinChart(
    coinId,
    metricDays,
  )
  const [dataType, setDataType] = useState<'price' | 'marketCap'>('price')

  const { data: dataChart, isLoading: isLoadingChart } = useCoinChart(
    coinId,
    days,
  )
  const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>(
    () =>
      (localStorage.getItem('coin-view-mode') as 'pagination' | 'infinite') ||
      'pagination',
  )

  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    localStorage.setItem('coin-view-mode', mode)
  }

  return (
    <div className='flex min-h-screen'>
      {/* LEFT */}
      <div className='w-3/4 flex flex-col'>
        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            value && handleModeChange(value as 'pagination' | 'infinite')
          }
          className='w-full border-b'
        >
          <TabsList className='w-full p-0 bg-card rounded-sm'>
            <TabsTrigger
              value='pagination'
              className='flex-1 gap-2 rounded-xs text-md font-medium transition-all'
            >
              <LayoutGrid className='h-4 w-4' />
              Classic mode
            </TabsTrigger>
            <TabsTrigger
              value='infinite'
              className='flex-1 gap-2 rounded-xs text-md font-medium transition-all'
            >
              <TerminalSquare className='h-4 w-4' />
              Terminal mode
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === 'pagination' ? (
          <div className='flex flex-col min-w-0'>
            <div className='h-150 min-w-0 relative w-full'>
              <CoinChart
                coinId={coinId}
                chart={dataChart}
                symbol={data?.symbol}
                days={days}
                onDaysChange={setDays}
                dataType={dataType}
                onDataTypeChange={setDataType}
                isLoading={isLoadingChart}
                view={'classic'}
              />
            </div>
            <div className='flex flex-col p-5 gap-5'>
              <CoinPriceChange coin={data} isLoading={isLoadingCoin} />
              <CoinDescription
                description={data?.description}
                isLoading={isLoadingCoin}
              />

              <div className='grid xs:grid-cols-1 grid-cols-2 gap-5 items-stretch'>
                <CoinTokenomics coin={data} isLoading={isLoadingCoin} />
                <CoinMarketDominance
                  coin={data}
                  isLoading={isLoadingCoin}
                  globalData={globalData}
                />
              </div>

              <div className='grid grid-cols-1 gap-5'>
                <CoinRiskMetrics
                  coin={data}
                  chart={metricsChart}
                  days={metricDays}
                  onDaysChange={setMetricDays}
                  isLoadingCoin={isLoadingCoin}
                  isLoadingChart={isLoadingMetrics}
                />
              </div>

              <CoinRoiCalculator coin={data} isLoading={isLoadingCoin} />
              <CoinMarketScenarios coin={data} isLoading={isLoadingCoin} />

              <CoinTickersTable
                coinName={data?.name || ''}
                tickers={data?.tickers ?? []}
                loading={isLoadingCoin}
                mode='pagination'
              />
            </div>
          </div>
        ) : (
          <ResizablePanelGroup orientation='vertical'>
            <ResizablePanel
              defaultSize='70%'
              minSize='35%'
              className='min-h-0 min-w-0'
            >
              <div className='h-full min-h-0 min-w-0'>
                <CoinChart
                  coinId={coinId}
                  chart={dataChart}
                  symbol={data?.symbol}
                  days={days}
                  onDaysChange={setDays}
                  dataType={dataType}
                  onDataTypeChange={setDataType}
                  isLoading={isLoadingChart}
                  view={'terminal'}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize='30%' minSize='20%'>
              <div className='relative h-full overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30'>
                <div className='py-5'>
                  <CoinTickersTable
                    coinName={data?.name || ''}
                    tickers={data?.tickers ?? []}
                    loading={isLoadingCoin}
                    mode='infinite'
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* RIGHT */}
      <div className='min-w-1/4 sticky top-0 h-screen flex flex-col border-l'>
        <div className='bg-background px-5 pt-5 pb-6 relative'>
          <CoinHeader coin={data} isLoading={isLoadingCoin} days={days} />
        </div>

        <div className='flex-1 overflow-y-auto no-scrollbar px-5 pb-5 flex flex-col gap-3'>
          <CoinStatistics coin={data} isLoading={isLoadingCoin} />
          <CoinInfo coin={data} isLoading={isLoadingCoin} />
          <CoinSentiment coin={data} isLoading={isLoadingCoin} />
          <CoinPricePerformance coin={data} isLoading={isLoadingCoin} />
          <CoinConverter coin={data} isLoading={isLoadingCoin} />
        </div>
      </div>
    </div>
  )
}
