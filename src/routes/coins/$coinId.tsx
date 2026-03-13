import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { useCoin } from '@/features/market/hooks/coins-queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading } = useCoin(coinId)
  console.log(data)
  if (isLoading) return <div> LOADING </div>
  return (
    <div className='flex'>
      <CoinChart symbol={data?.symbol}></CoinChart>
    </div>
  )
}
