import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { CoinHeader } from '@/features/market/components/coin-page/coin-header'
import { useCoin } from '@/features/market/hooks/coins-queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading } = useCoin(coinId)
  console.log(data)
  if (isLoading)
    return (
      <div className='text-3xl flex justify-center h-screen text-center items-center'>
        LOADING...
      </div>
    )
  return (
    <div className='flex'>
      <CoinChart symbol={data?.symbol}></CoinChart>
      <div className='flex flex-col'>
        <CoinHeader></CoinHeader>
      </div>
    </div>
  )
}
