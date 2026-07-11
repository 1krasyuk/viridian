import { Bookmark, Plus, RefreshCcw } from 'lucide-react'
import type { Multichart } from '../types/types'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

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
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant='secondary'
            size='icon-sm'
            className='shrink-0'
            aria-label='Reset multichart page'
          >
            <RefreshCcw />
          </Button>
        </DialogTrigger>
        <DialogContent className='rounded-xl bg-card'>
          <DialogHeader>
            <DialogTitle>Reset multichart page?</DialogTitle>
            <DialogDescription>
              All multicharts and added coins will be cleared, and the default
              settings will be restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='sm:justify-between!'>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant='destructive' onClick={onReset}>
                Reset
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
