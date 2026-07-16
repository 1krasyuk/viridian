import type { ComponentType, ReactNode } from 'react'
import { CircleHelp } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function MarketSectionHeader({
  icon: Icon,
  title,
  description,
  tooltip,
  badge,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: ReactNode
  tooltip: ReactNode
  badge?: string
}) {
  return (
    <div className='mb-3 min-w-0'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <Icon className='size-5 shrink-0 text-foreground' />
          <h2 className='truncate text-xl font-semibold'>{title}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                aria-label={`About ${title}`}
                className='shrink-0 text-muted-foreground transition-colors hover:text-foreground'
              >
                <CircleHelp className='size-4' />
              </button>
            </TooltipTrigger>
            <TooltipContent className='max-w-72 leading-relaxed'>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        {badge && (
          <Badge variant='secondary' className='shrink-0'>
            {badge}
          </Badge>
        )}
      </div>
      <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}
