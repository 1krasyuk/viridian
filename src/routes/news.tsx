import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { NewsPage } from '@/features/news/components/news-page'

const searchSchema = z.object({
  topic: z
    .enum(['general', 'crypto', 'ai', 'fintech', 'macro', 'earnings'])
    .optional(),
})

export const Route = createFileRoute('/news')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return <NewsPage />
}
