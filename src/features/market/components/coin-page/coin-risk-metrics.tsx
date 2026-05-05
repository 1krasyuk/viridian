// features/market/components/coin-page/coin-risk-metrics.tsx
import { Activity, TrendingDown, Zap, Gauge } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Coin } from '../../types/coin'
import type { CoinChart } from '../../types/coin-chart'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

function calculateVolatility(prices?: { value: number }[]): number | null {
  if (!prices || prices.length < 2) return null
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i].value - prices[i - 1].value) / prices[i - 1].value)
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  return Math.sqrt(variance) * 100
}

function calculateMaxDrawdown(prices?: { value: number }[]): number | null {
  if (!prices || prices.length < 2) return null
  let maxPeak = prices[0].value
  let maxDrawdown = 0
  for (const { value } of prices) {
    if (value > maxPeak) maxPeak = value
    const drawdown = (maxPeak - value) / maxPeak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }
  return maxDrawdown * 100
}

type RiskMetricProps = {
  label: string
  value: number | null
  format: 'percent' | 'number'
  icon: React.ReactNode
  color: string
  description: string
}

function RiskMetric({
  label,
  value,
  format,
  icon,
  color,
  description,
}: RiskMetricProps) {
  const formatted =
    value != null
      ? format === 'percent'
        ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
        : value.toFixed(2)
      : '—'

  return (
    <div className='flex items-center gap-3 p-2 rounded-md bg-card'>
      <div className={`p-1.5 rounded-md ${color}`}>{icon}</div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <span className='text-xs'>{label}</span>
          <span
            className={`text-sm font-bold font-mono ${value != null && value > 50 ? 'text-red-500' : value != null && value < 20 ? 'text-emerald-500' : ''}`}
          >
            {formatted}
          </span>
        </div>
        <p className='text-[10px] text-muted-foreground truncate'>
          {description}
        </p>
      </div>
    </div>
  )
}

export function CoinRiskMetrics({
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
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className='rounded-lg border bg-card p-4 space-y-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-16 w-full' />
        <Skeleton className='h-16 w-full' />
        <Skeleton className='h-16 w-full' />
      </div>
    )
  }

  const prices = chart?.prices
  const volatility = calculateVolatility(prices)
  const maxDrawdown = calculateMaxDrawdown(prices)

  const ath = coin?.market_data?.ath?.usd
  // const atl = coin?.market_data?.atl?.usd
  const current = coin?.market_data?.current_price?.usd
  const athDistance = ath && current ? ((ath - current) / ath) * 100 : null

  const volume24h = coin?.market_data?.total_volume?.usd
  const marketCap = coin?.market_data?.market_cap?.usd
  const turnover = volume24h && marketCap ? (volume24h / marketCap) * 100 : null

  return (
    <div className='rounded-lg border  p-4 space-y-3'>
      <div className='flex'>
        <h3 className='text-sm font-bold uppercase tracking-wide flex text-muted-foreground items-center gap-2'>
          <Gauge className='h-5 w-5' />
          Risk Metrics
        </h3>

        <ToggleGroup
          type='single'
          value={days}
          size='sm'
          variant='outline'
          onValueChange={(v) => v && onDaysChange(v)}
        >
          <ToggleGroupItem value='1' size='sm'>
            24H
          </ToggleGroupItem>
          <ToggleGroupItem value='7' size='sm'>
            7D
          </ToggleGroupItem>
          <ToggleGroupItem value='30' size='sm'>
            30D
          </ToggleGroupItem>
          <ToggleGroupItem value='90' size='sm'>
            90D
          </ToggleGroupItem>
          <ToggleGroupItem value='365' size='sm'>
            1Y
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='space-y-2'>
        <RiskMetric
          label='Volatility (30d)'
          value={volatility}
          format='percent'
          icon={<Activity className='h-3.5 w-3.5' />}
          color='bg-amber-500/10 text-amber-500'
          description='Price fluctuation intensity. >50% = high risk.'
        />

        <RiskMetric
          label='Max Drawdown'
          value={maxDrawdown}
          format='percent'
          icon={<TrendingDown className='h-3.5 w-3.5' />}
          color='bg-red-500/10 text-red-500'
          description='Largest peak-to-trough decline from ATH.'
        />

        <RiskMetric
          label='ATH Distance'
          value={athDistance}
          format='percent'
          icon={<Zap className='h-3.5 w-3.5' />}
          color='bg-blue-500/10 text-blue-500'
          description='How far current price is from all-time high.'
        />

        <RiskMetric
          label='Turnover Ratio'
          value={turnover}
          format='percent'
          icon={<Activity className='h-3.5 w-3.5' />}
          color='bg-emerald-500/10 text-emerald-500'
          description='24h volume vs market cap. >100% = very active.'
        />
      </div>
    </div>
  )
}
