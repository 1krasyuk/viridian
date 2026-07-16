import { LayoutGrid, TerminalSquare } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import type { CoinViewMode } from './use-coin-view-mode'

type CoinPageViewModeTabsProps = {
  value: CoinViewMode
  onValueChange: (value: CoinViewMode) => void
}

export function CoinPageViewModeTabs({
  value,
  onValueChange,
}: CoinPageViewModeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === 'pagination' || nextValue === 'infinite') {
          onValueChange(nextValue)
        }
      }}
      className='w-full border-b'
    >
      <TabsList className='w-full p-0 bg-card rounded-sm'>
        <TabsTrigger
          value='pagination'
          className='flex-1 gap-2 rounded-xs text-md font-medium transition-all'
        >
          <LayoutGrid className='h-4 w-4' />
          Classic mode
        </TabsTrigger>
        <TabsTrigger
          value='infinite'
          className='flex-1 gap-2 rounded-xs text-md font-medium transition-all'
        >
          <TerminalSquare className='h-4 w-4' />
          Terminal mode
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
