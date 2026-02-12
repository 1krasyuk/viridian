import { CoinsTable } from '@/features/market/components/coins-table/coins-table'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().optional(),
})

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return <CoinsTable />
}
