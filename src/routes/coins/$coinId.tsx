import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { CoinHeader } from '@/features/market/components/coin-page/coin-header'
import { CoinPricePerformance } from '@/features/market/components/coin-page/coin-price-perfomance'
import { CoinStatistics } from '@/features/market/components/coin-page/coin-statistics'

import { useCoin } from '@/features/market/hooks/coins-queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading } = useCoin(coinId)
  console.log(data)
  if (isLoading || !data)
    return (
      <div className='text-3xl flex justify-center h-screen text-center items-center'>
        LOADING...
      </div>
    )
  return (
    <div className='flex'>
      <div className='w-3/4 h-screen'>
        <CoinChart symbol={data.symbol}></CoinChart>
      </div>
      <div className='w-1/4 p-5'>
        <CoinHeader coin={data}></CoinHeader>
        <CoinStatistics coin={data}></CoinStatistics>
        <CoinPricePerformance coin={data}></CoinPricePerformance>
      </div>
    </div>
  )
}
