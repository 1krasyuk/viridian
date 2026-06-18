import { Droplets, Flame, HeartPulse, Wind, Zap } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Coin } from '@/features/market/types/coin'
import {
  calculateMarketStress,
  getLiquidityLabel,
  getMomentum,
  getVolatilityTrend,
} from './risk-calculations'
import { RiskMetricCard } from './risk-metric-card'
import { getRiskSummary } from './risk-summary'

export function CoinRiskNow({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading: boolean
}) {
  const md = coin?.market_data
  const change1h = md?.price_change_percentage_1h_in_currency?.usd
  const change24h = md?.price_change_percentage_24h_in_currency?.usd
  const change7d = md?.price_change_percentage_7d_in_currency?.usd

  const volTrend = isLoading
    ? null
    : getVolatilityTrend(change1h, change24h, change7d)
  const momentum = isLoading ? null : getMomentum(change24h, change7d)

  const volume24h = md?.total_volume?.usd
  const marketCap = md?.market_cap?.usd
  const turnover = volume24h && marketCap ? (volume24h / marketCap) * 100 : 0
  const liquidity = getLiquidityLabel(turnover)

  const stress = isLoading
    ? null
    : calculateMarketStress(change1h, change24h, turnover)
  const summary = isLoading
    ? null
    : getRiskSummary(volTrend!, momentum!, stress!, liquidity, change24h)

  return (
    <div className='space-y-4 h-full flex flex-col'>
      <div className='flex items-center gap-2.5'>
        <div className='w-8 h-8 rounded-lg bg-linear-to-br from-red-500/15 to-orange-500/10 flex items-center justify-center border border-red-500/10'>
          <HeartPulse className='h-4 w-4 text-red-500' />
        </div>
        <h4 className='text-base font-bold tracking-tight'>Risk Now</h4>
      </div>
      <div className='grid grid-cols-2 gap-2.5'>
        <RiskMetricCard
          label='Volatility'
          value={
            volTrend ? (
              <span className={volTrend.color}>{volTrend.label}</span>
            ) : undefined
          }
          sub={volTrend?.sub}
          icon={<Wind className='h-3.5 w-3.5' />}
          color={volTrend?.color}
          tooltip='Compares 1h vs 24h vs 7d average daily change. Escalating = recent swings are bigger than usual.'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='Momentum'
          value={
            momentum ? (
              <span className={momentum.color}>{momentum.label}</span>
            ) : undefined
          }
          sub={momentum?.sub}
          icon={<Zap className='h-3.5 w-3.5' />}
          color={momentum?.color}
          tooltip='24h change vs average daily 7d change. Surging/Collapsing = momentum is extreme.'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='Stress'
          value={
            stress ? (
              <span className={stress.color}>{stress.label}</span>
            ) : undefined
          }
          sub={stress?.sub}
          icon={<Flame className='h-3.5 w-3.5' />}
          color={stress?.color}
          tooltip='Transparent formula: |24h|x3 + |1h|x4 + directionPenalty(15) + liquidityPenalty(8-20).'
          isLoading={isLoading}
        />

        <RiskMetricCard
          label='Liquidity'
          value={
            liquidity ? (
              <span className={liquidity.color}>{liquidity.label}</span>
            ) : undefined
          }
          sub={`${turnover.toFixed(1)}% turnover`}
          icon={<Droplets className='h-3.5 w-3.5' />}
          color={liquidity.color}
          tooltip='Volume vs Market Cap ratio. Higher = easier to buy/sell without moving the price.'
          isLoading={isLoading}
        />
      </div>
      <div className='flex-1 flex flex-col'>
        {!isLoading && summary && (
          <div
            className={`rounded-xl border p-4 space-y-2.5 ${summary.bg} flex-1 flex flex-col`}
          >
            <div className='flex items-center gap-2 shrink-0'>
              {summary.icon}
              <span
                className={`text-xs font-bold uppercase tracking-wider ${summary.color}`}
              >
                {summary.level} Risk
              </span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed flex-1'>
              {summary.text}
            </p>
          </div>
        )}

        {isLoading && (
          <div className='rounded-xl border p-4 space-y-2.5 bg-linear-to-br from-muted/30 to-muted/10 flex-1'>
            <Skeleton className='h-4 w-28 rounded-lg' />
            <Skeleton className='h-4 w-full rounded-lg' />
            <Skeleton className='h-4 w-4/5 rounded-lg' />
          </div>
        )}
      </div>
    </div>
  )
}
