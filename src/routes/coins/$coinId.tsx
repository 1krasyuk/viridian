import { useCoin } from '@/features/market/hooks/coins-queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading } = useCoin(coinId)
  console.log(data)
  return <div></div>
}
