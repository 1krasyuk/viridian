import { Skeleton } from '@/shared/ui/skeleton'
import { Loader2 } from 'lucide-react'

export function CoinChartLoader() {
  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='flex justify-between p-2'>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='h-9 w-48' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-64' />
          <Skeleton className='h-9 w-9' />
          <Skeleton className='h-9 w-9' />
        </div>
      </div>
      <div className='flex-1 min-h-0 relative min-w-0 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
          <span className='text-sm text-muted-foreground font-medium'>
            Loading chart data...
          </span>
        </div>
      </div>
    </div>
  )
}

export default CoinChartLoader
