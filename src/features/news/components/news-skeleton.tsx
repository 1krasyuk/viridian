import { Skeleton } from '@/shared/ui/skeleton'

export function NewsSkeleton() {
  return (
    <div className='grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]'>
      <Skeleton className='h-80 rounded-2xl md:h-[25rem]' />
      <div className='grid gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-28 rounded-2xl' />
        ))}
      </div>
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton key={index} className='h-72 rounded-2xl' />
      ))}
    </div>
  )
}
