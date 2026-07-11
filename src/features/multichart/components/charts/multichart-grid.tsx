import { ChartNoAxesCombined, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { ChartItem } from '../../types/types'
import { MultichartChartCard } from './multichart-chart-card'
import { MAX_CHARTS } from '../../types/constants'

export function MultichartGrid({
  charts,
  columns,
  gap,
  height,
  onAdd,
  onChange,
  onRemove,
}: {
  charts: ChartItem[]
  columns: number
  gap: number
  height: number
  onAdd: () => void
  onChange: (
    id: string,
    patch: Partial<Pick<ChartItem, 'days' | 'dataType'>>,
  ) => void
  onRemove: (id: string) => void
}) {
  if (charts.length === 0)
    return (
      <div className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center'>
        <div className='mb-4 rounded-full border bg-background p-3'>
          <ChartNoAxesCombined className='size-6 text-primary' />
        </div>
        <h1 className='text-lg font-semibold'>
          Analyze several charts at once
        </h1>
        <p className='mt-2 max-w-md text-sm text-muted-foreground'>
          Add coins from the top 250 to compare prices, market caps and
          different periods in one workspace.
        </p>
        <Button className='mt-5' onClick={onAdd}>
          <Plus /> Add a coin
        </Button>
      </div>
    )
  return (
    <div
      className='grid w-full'
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}rem`,
      }}
    >
      {charts.map((item) => (
        <MultichartChartCard
          key={item.id}
          item={item}
          height={height}
          onChange={(patch) => onChange(item.id, patch)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
      {charts.length < MAX_CHARTS && (
        <button
          type='button'
          onClick={onAdd}
          className='flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/20 hover:text-foreground'
          style={{ height }}
        >
          <Plus className='mb-2 size-7' />
          <span>{MAX_CHARTS - charts.length} chart slots available</span>
        </button>
      )}
    </div>
  )
}
