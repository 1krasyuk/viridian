import { Info, Sparkles } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

export function ScenarioHeader() {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
          <Sparkles className='h-4 w-4 text-emerald-500' />
        </div>
        <div>
          <div className='flex items-center gap-1.5'>
            <h2 className='text-base font-bold tracking-tight'>
              Market Scenarios
            </h2>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-4 w-4 shrink-0 cursor-default text-muted-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent side='right' className='max-w-xs'>
                  <div className='text-xs leading-relaxed space-y-1.5'>
                    <p>
                      Explore potential market outcomes based on historical data
                      and current market conditions.
                    </p>
                    <p className='text-muted-foreground'>
                      Not a price prediction. Adjust investment and time horizon
                      to see different scenarios.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className='text-xs text-muted-foreground'>
            Probabilistic projections
          </p>
        </div>
      </div>
    </div>
  )
}
