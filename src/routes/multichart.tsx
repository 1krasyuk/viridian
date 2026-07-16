import { createFileRoute } from '@tanstack/react-router'
import { MultichartPage } from '@/features/multichart/components/multichart-page'

export const Route = createFileRoute('/multichart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MultichartPage />
}
