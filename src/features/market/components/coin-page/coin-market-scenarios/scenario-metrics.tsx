import { Activity, AlertTriangle, Gauge, Info } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { formatScenarioPercent } from './formatters'

type VolatilityProfile = {
  label: string
  level: 'low' | 'medium' | 'high'
}

function profileClass(level: VolatilityProfile['level']) {
  return level === 'low'
    ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/8'
    : level === 'high'
      ? 'text-red-500 border-red-500/20 bg-red-500/8'
      : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/8'
}

export function ScenarioMetrics({
  volatility,
  trendScore,
  volProfile,
  isLoading,
}: {
  volatility: number
  trendScore: number
  volProfile: VolatilityProfile
  isLoading: boolean
}) {
  return (
    <>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='flex items-center justify-between rounded-xl bg-linear-to-br from-muted/40 to-muted/20 px-4 py-3 border border-border/30'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-muted-foreground/10 flex items-center justify-center'>
              <Gauge className='h-3.5 w-3.5 text-foreground' />
            </div>
            <div>
              <span className='text-sm text-muted-foreground'>Volatility</span>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3 w-3 text-muted-foreground inline ml-1 transition-colors' />
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-xs'>
                    <p className='text-xs leading-relaxed'>
                      Standard deviation of 24h, 7d, and 30d price changes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className='h-6 w-16 rounded-lg' />
          ) : (
            <Badge
              variant='outline'
              className={`text-xs h-6 px-2.5 font-mono rounded-lg ${profileClass(
                volProfile.level,
              )}`}
            >
              {volatility.toFixed(1)}
            </Badge>
          )}
        </div>

        <div className='flex items-center justify-between rounded-xl bg-linear-to-br from-muted/40 to-muted/20 px-4 py-3 border border-border/30'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-muted-foreground/10 flex items-center justify-center'>
              <Activity className='h-3.5 w-3.5 text-foreground' />
            </div>
            <div>
              <span className='text-sm text-muted-foreground'>Trend</span>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3 w-3 text-muted-foreground inline ml-1 transition-colors' />
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-xs'>
                    <p className='text-xs leading-relaxed'>
                      Weighted momentum: 20% x 7d + 50% x 30d + 30% x 1y change.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className='h-6 w-16 rounded-lg' />
          ) : (
            <Badge
              variant='outline'
              className={`text-xs h-6 px-2.5 font-mono rounded-lg ${
                trendScore > 0
                  ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/8'
                  : trendScore < 0
                    ? 'text-red-500 border-red-500/20 bg-red-500/8'
                    : 'text-muted-foreground border-muted-foreground/20'
              }`}
            >
              {formatScenarioPercent(trendScore)}
            </Badge>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between rounded-xl bg-linear-to-r from-muted/50 via-muted/30 to-muted/50 px-4 py-3 border border-border/30'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center'>
            <AlertTriangle className='h-4 w-4 text-foreground' />
          </div>
          <div>
            <p className='text-sm font-bold'>Risk Profile</p>
            <p className='text-xs text-muted-foreground'>
              Based on historical volatility
            </p>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className='h-6 w-16 rounded-lg' />
        ) : (
          <Badge
            variant='outline'
            className={`text-xs h-6 px-3 rounded-lg font-medium ${profileClass(
              volProfile.level,
            )}`}
          >
            {volProfile.label}
          </Badge>
        )}
      </div>
    </>
  )
}
