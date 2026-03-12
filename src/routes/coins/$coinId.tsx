import { CoinPage } from '@/features/market/components/coin-page/coin-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CoinPage />
}
