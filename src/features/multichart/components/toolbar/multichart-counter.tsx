import { Minus, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function MultichartCounter({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
  mobileLocked = false,
}: {
  label: string
  value: string | number
  onDecrease: () => void
  onIncrease: () => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  mobileLocked?: boolean
}) {
  return (
    <div className='flex h-8 min-w-0 items-center rounded-md border bg-secondary/55 px-1 lg:h-9 lg:pl-3 lg:pr-1'>
      <span className='min-w-0 whitespace-nowrap text-xs text-muted-foreground lg:text-xs'>
        {label}
      </span>
      <div className='ml-auto flex shrink-0 items-center'>
        <Button
          variant='ghost'
          size='icon-sm'
          className='size-4.5 p-0 lg:size-8 [&_svg]:size-3 lg:[&_svg]:size-4'
          onClick={onDecrease}
          disabled={decreaseDisabled || mobileLocked}
          aria-label={`Decrease ${label}`}
        >
          <Minus />
        </Button>
        <span className='min-w-4 text-center text-xs font-semibold tabular-nums lg:min-w-7 lg:text-sm'>
          {mobileLocked ? 1 : value}
        </span>
        <Button
          variant='ghost'
          size='icon-sm'
          className='size-4.5 p-0 lg:size-8 [&_svg]:size-3 lg:[&_svg]:size-4'
          onClick={onIncrease}
          disabled={increaseDisabled || mobileLocked}
          aria-label={`Increase ${label}`}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}
