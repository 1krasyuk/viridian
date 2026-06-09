import {
  Activity,
  BarChart3,
  ChevronDown,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { Coin } from '@/features/market/types/coin'
import type { CoinChart } from '@/features/market/types/coin-chart'
import {
  calculateMaxDrawdown,
  calculateVolatility,
  getRiskColor,
} from './risk-calculations'
import { RiskMetricCard } from './risk-metric-card'

const PERIOD_LABELS: Record<string, string> = {
  '1': '24H',
  '7': '7D',
  '30': '1M',
  '90': '3M',
  '365': '1Y',
}

export function CoinPeriodAnalysis({
  coin,
  chart,
  days,
  onDaysChange,
  isLoading,
}: {
  coin: Coin | undefined
  chart?: CoinChart
  days: string
  onDaysChange: (v: string) => void
  isLoading: boolean
}) {
  const prices = chart?.prices

  const periodVolatility = isLoading ? null : calculateVolatility(prices)
  const periodDrawdown = isLoading ? null : calculateMaxDrawdown(prices)

  const periodChange =
    !isLoading && prices && prices.length >= 2
      ? ((prices[prices.length - 1].value - prices[0].value) /
          prices[0].value) *
        100
      : null

  const avgPrice =
    !isLoading && prices && prices.length > 0
      ? prices.reduce((sum, p) => sum + p.value, 0) / prices.length
      : null

  const current = coin?.market_data?.current_price?.usd
  const vsAvg =
    !isLoading && current && avgPrice
      ? ((current - avgPrice) / avgPrice) * 100
      : null

  return (
    <div className='space-y-4 flex flex-col h-full'>
      <div className='flex items-center gap-2.5 shrink-0'>
        <div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-500/15 to-indigo-500/10 flex items-center justify-center border border-blue-500/10'>
          <Clock className='h-4 w-4 text-blue-500' />
        </div>
        <h4 className='text-base font-bold tracking-tight'>Period Analysis</h4>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs gap-1 px-2.5 rounded-lg ml-auto bg-muted/30 border-muted-foreground/10 hover:bg-muted/50'
              disabled={isLoading}
            >
              {PERIOD_LABELS[days] || days}
              <ChevronDown className='h-3 w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-20 rounded-xl'>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onDaysChange(value)}
                className={`text-xs px-2 py-1.5 rounded-lg cursor-pointer ${
                  days === value ? 'bg-accent' : ''
                }`}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
        <RiskMetricCard
          label='Return'
          value={
            periodChange !== null ? (
              <span className={getRiskColor(periodChange, 'higher-is-better')}>
                {periodChange >= 0 ? '+' : ''}
                {periodChange.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub={`over ${PERIOD_LABELS[days]?.toLowerCase() || days}`}
          icon={
            <TrendingUp
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodChange,
                'higher-is-better',
              )}`}
            />
          }
          tooltip='Total price change from start to end of the selected period.'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='Swing'
          value={
            periodVolatility !== null ? (
              <span
                className={getRiskColor(periodVolatility, 'lower-is-better')}
              >
                {periodVolatility.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='price fluctuation'
          icon={
            <Activity
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodVolatility,
                'lower-is-better',
              )}`}
            />
          }
          tooltip='How much price bounced around during the period.'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='Drawdown'
          value={
            periodDrawdown !== null ? (
              <span className={getRiskColor(periodDrawdown, 'lower-is-better')}>
                {periodDrawdown.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='peak-to-trough'
          icon={
            <TrendingDown
              className={`h-3.5 w-3.5 ${getRiskColor(
                periodDrawdown,
                'lower-is-better',
              )}`}
            />
          }
          tooltip='Largest drop from a peak to a trough within the period.'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='vs Average'
          value={
            vsAvg !== null ? (
              <span className={getRiskColor(vsAvg, 'higher-is-better')}>
                {vsAvg >= 0 ? '+' : ''}
                {vsAvg.toFixed(2)}%
              </span>
            ) : undefined
          }
          sub='current vs avg'
          icon={
            <BarChart3
              className={`h-3.5 w-3.5 ${getRiskColor(
                vsAvg,
                'higher-is-better',
              )}`}
            />
          }
          tooltip='How current price compares to the average price over the selected period.'
          isLoading={isLoading}
        />
      </div>

      <div className='flex-1 bg-linear-to-br from-muted/40 to-muted/20 p-4 rounded-xl border border-border/30 flex flex-col justify-center'>
        <div className='space-y-2'>
          <PriceRow
            label='Period open'
            value={prices?.[0]?.value}
            isLoading={isLoading}
          />
          <PriceRow
            label='Period close'
            value={prices?.[prices.length - 1]?.value}
            isLoading={isLoading}
          />
          <PriceRow label='Average' value={avgPrice} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

function PriceRow({
  label,
  value,
  isLoading,
}: {
  label: string
  value?: number | null
  isLoading: boolean
}) {
  return (
    <div className='flex justify-between text-xs'>
      <span className='text-muted-foreground'>{label}</span>
      {isLoading ? (
        <Skeleton className='h-3.5 w-20 rounded-lg' />
      ) : (
        <span className='font-mono font-medium'>
          $
          {value?.toLocaleString('en-US', {
            maximumFractionDigits: 2,
          }) || '—'}
        </span>
      )}
    </div>
  )
}
