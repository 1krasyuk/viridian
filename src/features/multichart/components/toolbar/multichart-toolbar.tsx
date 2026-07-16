import { Bookmark, Check, Ellipsis, Pencil, RefreshCcw, Search, SlidersHorizontal, Trash2 } from 'lucide-react'

import type { CoinChartDataType } from '@/features/market/components/coin-page/coin-chart/types'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import {
  GAP_STEPS,
  HEIGHT_STEPS,
  MAX_CHARTS,
  MAX_COLUMNS,
  PERIODS,
} from '../../types/constants'
import type { Multichart } from '../../types/types'
import { MultichartCounter } from './multichart-counter'

function stepValue<T>(values: T[], current: T, direction: -1 | 1) {
  const index = values.indexOf(current)
  return values[Math.max(0, Math.min(values.length - 1, index + direction))]
}

export function MultichartToolbar({
  active,
  chartCount,
  columns,
  gap,
  heightPercent,
  globalDays,
  globalDataType,
  compact,
  sidebarOpen,
  onDaysChange,
  onDataTypeChange,
  onColumnsChange,
  onGapChange,
  onHeightChange,
  onSearch,
  onToggleScreener,
  onRename,
  onMakeDefault,
  onClear,
  onDelete,
}: {
  active: Multichart
  chartCount: number
  columns: number
  gap: number
  heightPercent: number
  globalDays: string
  globalDataType: CoinChartDataType
  compact: boolean
  sidebarOpen: boolean
  onDaysChange: (value: string) => void
  onDataTypeChange: (value: CoinChartDataType) => void
  onColumnsChange: (value: number) => void
  onGapChange: (value: number) => void
  onHeightChange: (value: number) => void
  onSearch: () => void
  onToggleScreener: () => void
  onRename: () => void
  onMakeDefault: () => void
  onClear: () => void
  onDelete: () => void
}) {
  return (
    <div className='sticky top-14 z-20 grid grid-cols-2 gap-2 border-b bg-background px-3 py-3 md:top-0 lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:px-5'>
      <Select value={globalDays} onValueChange={onDaysChange}>
        <SelectTrigger className='w-full rounded-md bg-secondary/55 lg:w-34'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={globalDataType}
        onValueChange={(value) => onDataTypeChange(value as CoinChartDataType)}
      >
        <SelectTrigger className='w-full rounded-md bg-secondary/55 lg:w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='price'>Price</SelectItem>
          <SelectItem value='marketCap'>Market cap</SelectItem>
        </SelectContent>
      </Select>
      <div className='col-span-2 grid grid-cols-3 gap-1 lg:contents'>
        <MultichartCounter
          mobileLocked={compact}
          label='Columns'
          value={columns}
          onDecrease={() => onColumnsChange(Math.max(1, columns - 1))}
          onIncrease={() => onColumnsChange(Math.min(MAX_COLUMNS, columns + 1))}
          decreaseDisabled={columns === 1}
          increaseDisabled={columns === MAX_COLUMNS}
        />
        <MultichartCounter
          label='Gap'
          value={gap}
          onDecrease={() => onGapChange(stepValue(GAP_STEPS, gap, -1))}
          onIncrease={() => onGapChange(stepValue(GAP_STEPS, gap, 1))}
          decreaseDisabled={gap === GAP_STEPS[0]}
          increaseDisabled={gap === GAP_STEPS.at(-1)}
        />
        <MultichartCounter
          label='Height'
          value={`${heightPercent}%`}
          onDecrease={() =>
            onHeightChange(stepValue(HEIGHT_STEPS, heightPercent, -1))
          }
          onIncrease={() =>
            onHeightChange(stepValue(HEIGHT_STEPS, heightPercent, 1))
          }
          decreaseDisabled={heightPercent === HEIGHT_STEPS[0]}
          increaseDisabled={heightPercent === HEIGHT_STEPS.at(-1)}
        />
      </div>
      <div className='col-span-2 flex w-full gap-2 lg:ml-auto lg:w-auto lg:flex-wrap lg:justify-end'>
        <Button
          variant='secondary'
          onClick={onSearch}
          disabled={chartCount >= MAX_CHARTS}
          className='min-w-0 flex-1 lg:flex-none'
        >
          <Search /> Search coins
        </Button>
        <Button
          variant='secondary'
          onClick={onToggleScreener}
          disabled={!sidebarOpen && chartCount >= MAX_CHARTS}
          className='hidden lg:inline-flex'
        >
          <SlidersHorizontal /> Coin screener
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant='secondary' size='icon' aria-label='Multichart options'><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align='end' side='bottom' className='w-64'>
            <DropdownMenuItem onSelect={onRename}><Pencil /> Rename</DropdownMenuItem>
            <DropdownMenuItem onSelect={onMakeDefault} className='whitespace-nowrap'><Bookmark className={cn(active.isDefault && 'fill-current text-foreground')} /> Make default multichart {active.isDefault && <Check className='ml-auto shrink-0' />}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onSelect={onClear} disabled={chartCount === 0}><RefreshCcw /> Clear multichart</DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onSelect={onDelete}><Trash2 /> Delete multichart</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
