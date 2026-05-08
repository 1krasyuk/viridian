// features/market/components/coin-page/coin-market-dominance.tsx
import {
  Globe,
  Crown,
  Layers,
  Target,
  BarChart3,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '@/features/market/types/coin'
import type { GlobalData } from '@/features/market/types/global'

interface CoinMarketDominanceProps {
  coin: Coin | undefined
  isLoading: boolean
  globalData?: GlobalData | null
}

function formatCompact(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (Math.abs(n) >= 1_000_000_000_000)
    return (n / 1_000_000_000_000).toFixed(2) + 'T'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatCurrency(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

// === DOMINANCE RING ===
function DominanceRing({
  dominancePercent,
  size = 110,
}: {
  dominancePercent: number
  size?: number
}) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset =
    circumference - (Math.min(dominancePercent, 100) / 100) * circumference

  const colorBg = '#3f3f46'
  const colorFill = '#4ade80'

  return (
    <div
      className='relative inline-flex items-center justify-center shrink-0'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorBg}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorFill}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-base font-bold font-mono'>
          {dominancePercent.toFixed(2)}%
        </span>
        <span className='text-[9px] text-muted-foreground uppercase tracking-wider'>
          Dominance
        </span>
      </div>
    </div>
  )
}

function DominanceRingSkeleton({ size = 110 }: { size?: number }) {
  return (
    <div
      className='relative inline-flex items-center justify-center shrink-0'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 10) / 2}
          fill='none'
          stroke='#3f3f46'
          strokeWidth={10}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center gap-1'>
        <Skeleton className='h-5 w-14' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  )
}

// === METRIC CARD ===
function MetricCard({
  icon,
  label,
  value,
  subvalue,
  accent = false,
  warning = false,
  isLoading = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subvalue?: string
  accent?: boolean
  warning?: boolean
  isLoading?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-2.5 space-y-1 ${
        warning
          ? 'bg-orange-500/10 border border-orange-500/20'
          : accent
            ? 'bg-emerald-500/15 border border-emerald-500/30'
            : 'bg-sidebar'
      }`}
    >
      <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
        {icon}
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className='h-6 w-28' />
      ) : (
        <p
          className={`text-base font-semibold font-mono tracking-tight ${
            warning ? 'text-orange-500' : accent ? 'text-emerald-500' : ''
          }`}
        >
          {value}
        </p>
      )}
      {subvalue && (
        <p className='text-[10px] text-muted-foreground font-mono'>
          {isLoading ? (
            <Skeleton className='h-3 w-20 inline-block' />
          ) : (
            subvalue
          )}
        </p>
      )}
    </div>
  )
}

// === COMPARISON BAR ===
function ComparisonBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftPercent,
  color = 'primary',
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
  leftPercent: number
  color?: 'primary' | 'emerald' | 'orange'
}) {
  const colors = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex justify-between text-xs'>
        <div>
          <p className='font-medium text-[11px]'>{leftLabel}</p>
          <p className='font-mono text-[10px] text-muted-foreground'>
            {leftValue}
          </p>
        </div>
        <div className='text-right'>
          <p className='font-medium text-[11px]'>{rightLabel}</p>
          <p className='font-mono text-[10px] text-muted-foreground'>
            {rightValue}
          </p>
        </div>
      </div>
      <div className='h-2 bg-muted rounded-full overflow-hidden flex'>
        <div
          className={`${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(leftPercent, 100)}%` }}
        />
      </div>
    </div>
  )
}

// === TIER BADGE ===
function getMarketTier(mcapRank: number | undefined): {
  label: string
  color: string
  desc: string
} {
  if (!mcapRank || mcapRank <= 0)
    return { label: 'Unknown', color: 'bg-muted', desc: 'No ranking data' }
  if (mcapRank === 1)
    return {
      label: 'King',
      color: 'bg-amber-500/20 text-amber-500',
      desc: '#1 by market cap',
    }
  if (mcapRank <= 3)
    return {
      label: 'Elite',
      color: 'bg-emerald-500/20 text-emerald-500',
      desc: 'Top 3 cryptocurrency',
    }
  if (mcapRank <= 10)
    return {
      label: 'Major',
      color: 'bg-primary/20 text-primary',
      desc: 'Top 10 cryptocurrency',
    }
  if (mcapRank <= 50)
    return {
      label: 'Mid-Cap',
      color: 'bg-blue-500/20 text-blue-500',
      desc: 'Top 50 cryptocurrency',
    }
  if (mcapRank <= 100)
    return {
      label: 'Established',
      color: 'bg-purple-500/20 text-purple-500',
      desc: 'Top 100 cryptocurrency',
    }
  if (mcapRank <= 500)
    return {
      label: 'Emerging',
      color: 'bg-yellow-500/20 text-yellow-500',
      desc: 'Top 500 cryptocurrency',
    }
  return {
    label: 'Micro',
    color: 'bg-muted text-muted-foreground',
    desc: 'Outside top 500',
  }
}

export function CoinMarketDominance({
  coin,
  isLoading,
  globalData,
}: CoinMarketDominanceProps) {
  const marketData = coin?.market_data
  const mcapRank = coin?.market_cap_rank
  const symbol = coin?.symbol?.toUpperCase() || ''
  const isBitcoin =
    coin?.id === 'bitcoin' || coin?.symbol?.toLowerCase() === 'btc'

  const mcap = marketData?.market_cap?.usd || 0
  const totalVolume = marketData?.total_volume?.usd || 0
  const currentPrice = marketData?.current_price?.usd || 0

  // Global data (fallback to estimate if not provided)
  const globalMcap = globalData?.totalMarketCap || 2_800_000_000_000
  const btcDominance = globalData?.marketCapPercentage?.btc || 62

  const dominance = mcap > 0 && globalMcap > 0 ? (mcap / globalMcap) * 100 : 0
  const relativeToBtc =
    dominance > 0 && btcDominance > 0 ? (dominance / btcDominance) * 100 : 0
  const volumeToMcap = mcap > 0 ? (totalVolume / mcap) * 100 : 0

  const tier = getMarketTier(mcapRank)

  // SKELETON STATE
  if (isLoading || !coin?.market_data) {
    return (
      <div className='rounded-lg border bg-background p-3 space-y-3'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
              <Globe className='h-4 w-4' />
              Market Dominance
            </h2>
            <Info className='h-4 w-4 text-muted-foreground' />
          </div>
        </div>

        <Skeleton className='h-6 w-32' />

        {/* Ring + Legend */}
        <div className='flex items-center gap-3'>
          <DominanceRingSkeleton size={110} />
          <div className='flex-1 space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-primary' />
                <span>This Asset</span>
              </div>
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-primary/30' />
                <span className='text-muted-foreground'>Rest of Market</span>
              </div>
              <Skeleton className='h-4 w-20' />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-muted border border-dashed border-muted-foreground/30' />
                <span className='text-muted-foreground'>BTC Dominance</span>
              </div>
              <Skeleton className='h-4 w-20' />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-2 gap-2'>
          <MetricCard
            icon={<Crown className='h-3 w-3' />}
            label='Market Rank'
            value=''
            isLoading
          />
          <MetricCard
            icon={<PieChart className='h-3 w-3' />}
            label='Market Share'
            value=''
            isLoading
          />
          <MetricCard
            icon={<Activity className='h-3 w-3' />}
            label='Volume/MCap'
            value=''
            isLoading
          />
          <MetricCard
            icon={<Target className='h-3 w-3' />}
            label={isBitcoin ? 'Market Position' : 'vs BTC'}
            value=''
            isLoading
          />
        </div>

        {/* Comparison bar */}
        <div className='space-y-1.5'>
          <div className='flex justify-between text-xs'>
            <div>
              <p className='font-medium text-[11px]'>This Asset</p>
              <Skeleton className='h-3 w-24 mt-0.5' />
            </div>
            <div className='text-right'>
              <p className='font-medium text-[11px]'>Bitcoin</p>
              <Skeleton className='h-3 w-24 mt-0.5 ml-auto' />
            </div>
          </div>
          <Skeleton className='h-2 w-full rounded-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-lg border bg-background p-3 space-y-3'>
      {/* Header — только Tier Badge, без Rank # */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            Market Dominance
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <div className='text-xs leading-relaxed space-y-1.5'>
                  <p className='font-semibold text-primary'>Market Context</p>
                  <p>
                    Shows how this asset ranks in the global crypto market.
                    Compare market share and position vs Bitcoin.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Tier Badge вместо Rank # */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${tier.color}`}
        >
          <Crown className='h-3 w-3' />
          <span>{tier.label}</span>
        </div>
      </div>

      {/* Ring + Legend */}
      <div className='flex items-center gap-3'>
        <DominanceRing dominancePercent={dominance} size={110} />
        <div className='flex-1 space-y-1.5'>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-[#4ade80]' />
              <span>{symbol || 'This Asset'}</span>
            </div>
            <span className='font-mono text-sm'>{formatCurrency(mcap)}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-[#4ade80]/30' />
              <span className='text-muted-foreground'>Rest of Market</span>
            </div>
            <span className='font-mono text-sm text-muted-foreground'>
              {formatCurrency(globalMcap - mcap)}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-[#a1a1aa]/40 border border-dashed border-[#a1a1aa]/40' />
              <span className='text-muted-foreground'>BTC Dominance</span>
            </div>
            <span className='font-mono text-sm text-muted-foreground'>
              {btcDominance.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          icon={<Crown className='h-3 w-3' />}
          label='Market Rank'
          value={mcapRank ? `#${mcapRank}` : '—'}
          subvalue={tier.desc}
          accent={mcapRank ? mcapRank <= 10 : false}
        />
        <MetricCard
          icon={<PieChart className='h-3 w-3' />}
          label='Market Share'
          value={`${dominance.toFixed(3)}%`}
          subvalue={`of ${formatCompact(globalMcap)} total`}
          accent={dominance > 1}
        />
        <MetricCard
          icon={<Activity className='h-3 w-3' />}
          label='Volume / MCap'
          value={`${volumeToMcap.toFixed(1)}%`}
          subvalue={
            volumeToMcap > 10
              ? 'High turnover'
              : volumeToMcap > 5
                ? 'Moderate turnover'
                : 'Low turnover'
          }
          warning={volumeToMcap < 1}
        />
        {/* FIX: для BTC показываем другую карточку */}
        {isBitcoin ? (
          <MetricCard
            icon={<Zap className='h-3 w-3' />}
            label='Market Position'
            value='King'
            subvalue='Original cryptocurrency'
            accent
          />
        ) : (
          <MetricCard
            icon={<Target className='h-3 w-3' />}
            label='vs BTC Dominance'
            value={`${relativeToBtc.toFixed(1)}%`}
            subvalue={`BTC is ${(btcDominance / Math.max(dominance, 0.001)).toFixed(0)}x larger`}
            accent={relativeToBtc > 50}
          />
        )}
      </div>

      {/* Comparison Bar — скрываем для BTC */}
      {!isBitcoin && dominance > 0 && btcDominance > 0 && (
        <ComparisonBar
          leftLabel={symbol || 'This Asset'}
          leftValue={`${dominance.toFixed(2)}%`}
          rightLabel='Bitcoin'
          rightValue={`${btcDominance.toFixed(1)}%`}
          leftPercent={(dominance / btcDominance) * 100}
          color={
            dominance > btcDominance * 0.1
              ? 'emerald'
              : dominance > btcDominance * 0.01
                ? 'primary'
                : 'orange'
          }
        />
      )}

      {/* Для BTC — просто текст что он лидер */}
      {isBitcoin && (
        <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5'>
          <div className='flex items-center gap-2'>
            <ArrowUpRight className='w-4 h-4 text-emerald-500 shrink-0' />
            <p className='font-semibold text-emerald-500 text-sm'>
              Market Leader
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed pl-6 mt-1'>
            Bitcoin dominates the crypto market with {dominance.toFixed(1)}% of
            total market cap.
          </p>
        </div>
      )}

      {/* Warning для мелких монет */}
      {!isBitcoin && dominance < 0.01 && mcapRank && mcapRank > 100 && (
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5'>
          <div className='flex items-center gap-2'>
            <ArrowDownRight className='w-4 h-4 text-orange-500 shrink-0' />
            <p className='font-semibold text-orange-500 text-sm'>
              Low Market Presence
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed pl-6 mt-1'>
            Less than 0.01% of total crypto market. Higher risk due to low
            liquidity.
          </p>
        </div>
      )}

      {/* Footer — компактный как в Tokenomics */}
      <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2'>
        <span className='flex items-center gap-1'>
          <BarChart3 className='h-3 w-3' />
          Price:{' '}
          <span className='font-mono text-foreground'>
            ${currentPrice.toLocaleString()}
          </span>
        </span>
        <span className='flex items-center gap-1'>
          <Layers className='h-3 w-3' />
          MCAP:{' '}
          <span className='font-mono text-foreground'>
            {formatCompact(mcap)}
          </span>
        </span>
        <span className='flex items-center gap-1'>
          <Activity className='h-3 w-3' />
          24h Vol:{' '}
          <span className='font-mono text-foreground'>
            {formatCompact(totalVolume)}
          </span>
        </span>
      </div>
    </div>
  )
}
