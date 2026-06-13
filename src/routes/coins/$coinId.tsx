import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useCoin,
  useCoinChart,
  useGlobalData,
} from '@/features/market/hooks/coins-queries'
import {
  ClassicCoinPageContent,
  CoinPageSidebar,
  TerminalCoinPageContent,
  MobileCoinPageContent,
} from '@/features/market/components/coin-page/coin-page-sections'
import { CoinPageViewModeTabs } from '@/features/market/components/coin-page/coin-page-view-mode-tabs'
import { useCoinViewMode } from '@/features/market/components/coin-page/use-coin-view-mode'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading: isLoadingCoin } = useCoin(coinId)
  const { data: globalData } = useGlobalData()
  const [days, setDays] = useState('1')
  const [metricDays, setMetricDays] = useState('30')
  const [dataType, setDataType] = useState<'price' | 'marketCap'>('price')
  const { viewMode, setViewMode } = useCoinViewMode()

  const { data: metricsChart, isLoading: isLoadingMetrics } = useCoinChart(
    coinId,
    metricDays,
  )

  const { data: dataChart, isLoading: isLoadingChart } = useCoinChart(
    coinId,
    days,
  )

  return (
    <div className='flex min-h-screen min-w-0 flex-col xl:flex-row'>
      {/* Desktop sidebar — справа */}
      <div className='hidden order-first xl:block xl:order-last'>
        <CoinPageSidebar coin={data} isLoading={isLoadingCoin} days={days} />
      </div>

      <div className='flex w-full min-w-0 flex-col xl:flex-1'>
        {/* Desktop tabs */}
        <div className='hidden xl:block'>
          <CoinPageViewModeTabs value={viewMode} onValueChange={setViewMode} />
        </div>

        {/* Desktop Classic */}
        {viewMode === 'pagination' && (
          <div className='hidden xl:block'>
            <ClassicCoinPageContent
              coinId={coinId}
              coin={data}
              chart={dataChart}
              days={days}
              onDaysChange={setDays}
              dataType={dataType}
              onDataTypeChange={setDataType}
              isLoadingCoin={isLoadingCoin}
              isLoadingChart={isLoadingChart}
              globalData={globalData}
              metricsChart={metricsChart}
              metricDays={metricDays}
              onMetricDaysChange={setMetricDays}
              isLoadingMetrics={isLoadingMetrics}
            />
          </div>
        )}

        {/* Desktop Terminal */}
        {viewMode === 'infinite' && (
          <div className='hidden xl:block h-full'>
            <TerminalCoinPageContent
              coinId={coinId}
              coin={data}
              chart={dataChart}
              days={days}
              onDaysChange={setDays}
              dataType={dataType}
              onDataTypeChange={setDataType}
              isLoadingCoin={isLoadingCoin}
              isLoadingChart={isLoadingChart}
            />
          </div>
        )}

        {/* Mobile */}
        <MobileCoinPageContent
          coinId={coinId}
          coin={data}
          chart={dataChart}
          days={days}
          onDaysChange={setDays}
          dataType={dataType}
          onDataTypeChange={setDataType}
          isLoadingCoin={isLoadingCoin}
          isLoadingChart={isLoadingChart}
          globalData={globalData}
          metricsChart={metricsChart}
          metricDays={metricDays}
          onMetricDaysChange={setMetricDays}
          isLoadingMetrics={isLoadingMetrics}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    </div>
  )
}
