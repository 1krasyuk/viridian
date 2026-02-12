import { CoinsTable } from '@/features/market/components/coins-table/coins-table'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.coerce.number().catch(1),
  per_page: z.coerce.number().catch(100),
})

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return <CoinsTable />
}
