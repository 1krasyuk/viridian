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
import { RefreshCcw } from 'lucide-react'

export function ResetMultichartDialog({ onReset }: { onReset: () => void }) {
  return (
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
  )
}
