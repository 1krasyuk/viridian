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

export function RenameMultichartDialog({
  open,
  name,
  onOpenChange,
  onNameChange,
  onRename,
}: {
  open: boolean
  name: string
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onRename: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-xl'>
        <DialogHeader>
          <DialogTitle>Rename multichart</DialogTitle>
          <DialogDescription>
            Choose a new name for this workspace.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onRename()}
          placeholder='Multichart name'
          className='rounded-md'
          autoFocus
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button onClick={onRename} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
