import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

type RiskMetricCardProps = {
  label: string
  value?: ReactNode
  sub?: string
  icon: ReactNode
  color?: string
  tooltip?: string
  isLoading?: boolean
  variant?: 'default' | 'glass' | 'accent'
}

export function RiskMetricCard({
  label,
  value,
  sub,
  icon,
  color = 'text-muted-foreground',
  tooltip,
  isLoading = false,
  variant = 'default',
}: RiskMetricCardProps) {
  const variants = {
    default:
      'bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30',
    glass:
      'bg-background/60 backdrop-blur-sm border border-border/40 shadow-sm',
    accent:
      'bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10',
  }

  return (
    <div
      className={`p-3 rounded-xl space-y-1.5 transition-all duration-200 ${variants[variant]}`}
    >
      <div className='flex items-center gap-1.5'>
        <span className={color}>{icon}</span>
        <span className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-3 w-3 text-muted-foreground/60 shrink-0 transition-colors' />
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-70'>
                <p className='text-xs'>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className='h-7 w-24 rounded-lg' />
          <Skeleton className='h-3 w-32 rounded-lg' />
        </>
      ) : (
        <>
          <div className='text-lg font-bold leading-tight'>{value}</div>
          {sub && (
            <div className='text-xs text-muted-foreground font-mono'>{sub}</div>
          )}
        </>
      )}
    </div>
  )
}
