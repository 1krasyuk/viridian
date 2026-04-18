import { Skeleton } from '@/shared/ui/skeleton'

export function CoinDescription({
  description,
  isLoading,
}: {
  description?: Record<string, string>
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div>
        <Skeleton className='h-6 w-20 mb-3' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[95%]' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[85%]' />
        </div>
      </div>
    )
  }

  if (!description?.en) {
    return null
  }

  return (
    <div>
      <h2 className='text-xl font-bold mb-3'>About</h2>
      <div className='prose max-w-full text-sm text-muted-foreground'>
        {description.en.split('\n\n\n').map((para, i) => (
          <p key={i}>
            {para.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  )
}
