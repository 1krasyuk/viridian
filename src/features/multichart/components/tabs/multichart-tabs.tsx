import { Bookmark, Plus } from 'lucide-react'
import type { Multichart } from '../../types/types'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ResetMultichartDialog } from '../dialog/multichart-dialog-reset'

export function MultichartTabs({
  multicharts,
  activeId,
  onActiveChange,
  onCreate,
  onReset,
}: {
  multicharts: Multichart[]
  activeId: string
  onActiveChange: (id: string) => void
  onCreate: () => void
  onReset: () => void
}) {
  return (
    <div className='flex items-center justify-between gap-2 border-b bg-background px-3 pt-2 md:px-5'>
      <Tabs
        value={activeId}
        onValueChange={onActiveChange}
        className='min-w-0 flex-1'
      >
        <TabsList
          variant='line'
          className='max-w-full overflow-x-auto overflow-y-hidden pb-1 group-data-horizontal/tabs:h-10!'
        >
          {multicharts.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.isDefault && (
                <Bookmark className='size-3.5 fill-current text-primary' />
              )}
              {item.name}
            </TabsTrigger>
          ))}
          <Button
            variant='ghost'
            size='sm'
            onClick={onCreate}
            className='shrink-0 text-primary'
          >
            <Plus /> New multichart
          </Button>
        </TabsList>
      </Tabs>
      <ResetMultichartDialog onReset={onReset} />
    </div>
  )
}
