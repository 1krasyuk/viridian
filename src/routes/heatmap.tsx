import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HeatmapPage } from '@/features/heatmap/components/heatmap-page'

const heatmapSearchSchema = z.object({
  period: z.enum(['1h', '24h', '7d', '30d', '1y']).optional(),
  size: z.enum(['market_cap', 'total_volume']).optional(),
  category: z.string().optional(),
})

export const Route = createFileRoute('/heatmap')({
  component: RouteComponent,
  validateSearch: heatmapSearchSchema,
})

function RouteComponent() {
  return <HeatmapPage />
}
