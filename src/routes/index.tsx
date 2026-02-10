import { CoinsTable } from '@/features/market/components/coins-table/coins-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CoinsTable />
}
