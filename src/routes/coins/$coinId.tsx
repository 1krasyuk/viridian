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
    <div className='flex min-h-screen'>
      <div className='w-3/4 flex flex-col'>
        <CoinPageViewModeTabs value={viewMode} onValueChange={setViewMode} />

        {viewMode === 'pagination' ? (
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
        ) : (
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
        )}
      </div>

      <CoinPageSidebar coin={data} isLoading={isLoadingCoin} days={days} />
    </div>
  )
}
