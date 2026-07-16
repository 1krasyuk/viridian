import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

export function CreateMultichartDialog({
  open,
  name,
  onOpenChange,
  onNameChange,
  onCreate,
}: {
  open: boolean
  name: string
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onCreate: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-xl bg-card'>
        <DialogHeader>
          <DialogTitle>Create multichart</DialogTitle>
          <DialogDescription>
            Give this chart workspace a name.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onCreate()}
          placeholder='Multichart name'
          className='rounded-md'
          autoFocus
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button onClick={onCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
