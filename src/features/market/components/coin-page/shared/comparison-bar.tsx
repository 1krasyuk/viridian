import { Skeleton } from '@/shared/ui/skeleton'

type ComparisonBarProps = {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
  leftPercent: number
  color?: 'primary' | 'emerald' | 'orange'
  isLoading?: boolean
}

export function ComparisonBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftPercent,
  color = 'primary',
  isLoading = false,
}: ComparisonBarProps) {
  const colors = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
  }

  if (isLoading) {
    return (
      <div className='space-y-1.5'>
        <div className='flex justify-between text-xs gap-2'>
          <div>
            <p className='font-medium text-[11px]'>{leftLabel}</p>
            <Skeleton className='h-3 w-24 mt-0.5' />
          </div>
          <div className='text-right'>
            <p className='font-medium text-[11px]'>{rightLabel}</p>
            <Skeleton className='h-3 w-24 mt-0.5 ml-auto' />
          </div>
        </div>
        <Skeleton className='h-2 w-full rounded-full' />
      </div>
    )
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex justify-between text-xs gap-2'>
        <div className='min-w-0'>
          <p className='font-medium text-[11px] text-muted-foreground'>
            {leftLabel}
          </p>
          <p className='wrap-break-word font-mono text-xs'>{leftValue}</p>
        </div>
        <div className='text-right min-w-0'>
          <p className='font-medium text-[11px] text-muted-foreground'>
            {rightLabel}
          </p>
          <p className='wrap-break-word font-mono text-xs'>{rightValue}</p>
        </div>
      </div>
      <div className='h-2 bg-muted rounded-full overflow-hidden flex'>
        <div
          className={`${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(leftPercent, 100)}%` }}
        />
      </div>
    </div>
  )
}
