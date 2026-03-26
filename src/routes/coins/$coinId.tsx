import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { CoinConverter } from '@/features/market/components/coin-page/coin-converter'
import { CoinDescription } from '@/features/market/components/coin-page/coin-description'
import { CoinHeader } from '@/features/market/components/coin-page/coin-header'
import { CoinInfo } from '@/features/market/components/coin-page/coin-info'
import { CoinPricePerformance } from '@/features/market/components/coin-page/coin-price-perfomance'
import { CoinSentiment } from '@/features/market/components/coin-page/coin-sentiment'
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
    <div className='flex min-h-screen'>
      {/* LEFT */}
      <div className='w-3/4 flex flex-col'>
        <div className='h-175'>
          <CoinChart symbol={data.symbol} />
        </div>
        <CoinDescription description={data.description} />{' '}
      </div>

      {/* RIGHT */}
      <div className='min-w-1/4 sticky top-0 h-screen flex flex-col border-l'>
        <div className='bg-background px-5 pt-5 pb-6 relative'>
          <CoinHeader coin={data} />
        </div>

        <div className='flex-1 overflow-y-auto no-scrollbar px-5 pb-5 flex flex-col gap-3'>
          <CoinStatistics coin={data} />
          <CoinInfo coin={data} />
          <CoinSentiment coin={data} />
          <CoinPricePerformance coin={data} />
          <CoinConverter coin={data} />
        </div>
      </div>
    </div>
  )
}
