import { RefreshCcw } from 'lucide-react'

import type { Category } from '@/features/market/types/categories'
import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import {
  CHANGE_RANGES,
  PERIODS,
  SIZE_METRICS,
  type ChangeRangeId,
  type HeatmapPeriod,
  type HeatmapSizeMetric,
} from '../types/heatmap-types'

type HeatmapToolbarProps = {
  period: HeatmapPeriod
  sizeMetric: HeatmapSizeMetric
  category: string | undefined
  categories: Category[]
  activeRanges: ChangeRangeId[]
  onPeriodChange: (value: HeatmapPeriod) => void
  onSizeMetricChange: (value: HeatmapSizeMetric) => void
  onCategoryChange: (value: string | undefined) => void
  onRangesChange: (value: ChangeRangeId[]) => void
  onReset: () => void
  isLoading?: boolean
}

function getRangeToggleClass(range: (typeof CHANGE_RANGES)[number]) {
  if (range.label === '0%') {
    return 'data-[state=on]:bg-muted/60 data-[state=on]:text-foreground'
  }

  if (range.min < 0 && range.max <= 0) {
    return 'data-[state=on]:bg-red-500/20 data-[state=on]:text-red-500 hover:bg-red-500/10'
  }

  return 'data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-500 hover:bg-emerald-500/10'
}

export function HeatmapToolbar({
  period,
  sizeMetric,
  category,
  categories,
  activeRanges,
  onPeriodChange,
  onSizeMetricChange,
  onCategoryChange,
  onRangesChange,
  onReset,
  isLoading = false,
}: HeatmapToolbarProps) {
  const categoryValue = categories.find((item) => item.category_id === category)

  return (
    <div className='sticky top-0 z-20 border-b bg-background/95 px-2 py-2.5 backdrop-blur'>
      <div className='grid gap-2 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center'>
        <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-2 xl:flex xl:min-w-0'>
          <Combobox
            items={categories}
            itemToStringValue={(item: Category) => item.name}
            itemToStringLabel={(item: Category) => item.name}
            value={categoryValue}
            onValueChange={(item) => {
              if (!isLoading) onCategoryChange(item?.category_id)
            }}
          >
            <ComboboxInput
              placeholder='Select a category'
              className='h-8 w-full shrink-0 rounded-md xl:w-56'
              showClear
              disabled={isLoading}
            />
            <ComboboxContent>
              <ComboboxEmpty>No category found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.category_id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <ToggleGroup
            type='single'
            value={sizeMetric}
            size='sm'
            onValueChange={(value) => {
              if (value === 'market_cap' || value === 'total_volume') {
                onSizeMetricChange(value)
              }
            }}
            disabled={isLoading}
            className='shrink-0 [&>button:first-child]:rounded-l-md! [&>button:last-child]:rounded-r-md!'
          >
            {SIZE_METRICS.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                variant='outline'
                disabled={isLoading}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className='flex min-w-0 items-center justify-between gap-2 xl:order-3 xl:justify-end'>
          <ToggleGroup
            type='single'
            value={period}
            size='sm'
            onValueChange={(value) => {
              if (value) onPeriodChange(value as HeatmapPeriod)
            }}
            disabled={isLoading}
            className='shrink-0 [&>button:first-child]:rounded-l-md! [&>button:last-child]:rounded-r-md!'
          >
            {PERIODS.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                variant='outline'
                disabled={isLoading}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            variant='outline'
            size='icon'
            onClick={onReset}
            className='group h-8 w-8 shrink-0 rounded-md'
            aria-label='Reset heatmap'
            disabled={isLoading}
          >
            <RefreshCcw className='size-4 transition-transform duration-500 ease-out group-active:rotate-180 group-active:duration-0' />
          </Button>
        </div>

        <ToggleGroup
          type='multiple'
          value={activeRanges}
          size='sm'
          onValueChange={(value) => {
            if (!isLoading) onRangesChange(value as ChangeRangeId[])
          }}
          disabled={isLoading}
          className='flex w-full min-w-0 rounded-md xl:order-2 xl:w-100 [&>button:first-child]:rounded-l-md! [&>button:last-child]:rounded-r-md!'
        >
          {CHANGE_RANGES.map((range) => (
            <ToggleGroupItem
              key={range.id}
              value={range.id}
              variant='outline'
              disabled={isLoading}
              className={`h-8 min-w-0 flex-1 basis-0 px-1 text-[11px] font-semibold text-muted-foreground sm:px-2 xl:min-w-13 ${getRangeToggleClass(range)}`}
            >
              {range.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
