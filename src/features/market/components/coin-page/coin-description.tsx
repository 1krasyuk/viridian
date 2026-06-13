import { useState } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

const MAX_LINES = 6

export function CoinDescription({
  description,
  isLoading,
}: {
  description?: Record<string, string>
  isLoading?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

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

  const paragraphs = description.en.split('\n\n\n')
  const totalLines = description.en.split('\n').length

  const shouldTruncate = totalLines > MAX_LINES && !expanded

  return (
    <div>
      <h2 className='text-xl font-bold mb-3'>About</h2>
      <div
        className={cn(
          'prose max-w-full text-sm text-muted-foreground relative',
          shouldTruncate && 'max-h-36 overflow-hidden',
        )}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className='leading-6'>
            {para.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ))}

        {shouldTruncate && (
          <div className='absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent' />
        )}
      </div>

      {totalLines > MAX_LINES && (
        <button
          onClick={() => setExpanded(!expanded)}
          className='mt-2 text-base font-bold text-muted-foreground hover:text-muted-foreground/80 transition-colors '
        >
          {expanded ? 'Show less' : 'More...'}
        </button>
      )}
    </div>
  )
}
