import { Gauge, Info } from 'lucide-react'
import type { Coin } from '../../types/coin'
import type { CoinChart } from '../../types/coin-chart'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { CoinPeriodAnalysis } from './coin-risk-metrics/period-analysis'
import { CoinRiskNow } from './coin-risk-metrics/risk-now'

export function CoinRiskMetrics({
  coin,
  chart,
  days,
  onDaysChange,
  isLoadingCoin = false,
  isLoadingChart = false,
}: {
  coin: Coin | undefined
  chart?: CoinChart
  days: string
  onDaysChange: (v: string) => void
  isLoadingCoin?: boolean
  isLoadingChart?: boolean
}) {
  return (
    <TooltipProvider>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
            <Gauge className='h-4 w-4 text-emerald-500' />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <h3 className='text-base font-bold tracking-tight'>
                Risk Metrics
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-4 w-4 shrink-0 cursor-default text-muted-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent side='right' className='max-w-xs'>
                  <div className='text-xs leading-relaxed space-y-1.5'>
                    <p>
                      Combines volatility, momentum, market stress, and
                      liquidity data to give you a quick snapshot of current
                      risk conditions.
                    </p>
                    <p className='text-muted-foreground'>
                      Left panel shows live risk signals. Right panel analyzes
                      historical performance over your selected time period.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='text-xs text-muted-foreground'>
              Real-time risk analysis
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch'>
          <div className='bg-linear-to-br from-card/60 to-background/40 backdrop-blur-sm rounded-xl border border-border/30 p-4'>
            <CoinRiskNow coin={coin} isLoading={isLoadingCoin} />
          </div>
          <div className='bg-linear-to-br from-card/60 to-background/40 backdrop-blur-sm rounded-xl border border-border/30 p-4'>
            <CoinPeriodAnalysis
              coin={coin}
              chart={chart}
              days={days}
              onDaysChange={onDaysChange}
              isLoading={isLoadingChart}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
