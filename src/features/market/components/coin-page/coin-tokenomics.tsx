// features/market/components/coin-page/coin-tokenomics.tsx
import {
  Layers,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Coins,
  DollarSign,
  Percent,
  Scale,
  BarChart3,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '@/features/market/types/coin'

interface CoinTokenomicsProps {
  coin: Coin | undefined
  isLoading: boolean
}

function formatCompact(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (Math.abs(n) >= 1_000_000_000_000)
    return (n / 1_000_000_000_000).toFixed(2) + 'T'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

function formatCurrency(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

function formatPercent(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(1) + '%'
}

// === SVG RING CHART ===
function SupplyRing({
  circulatingPercent,
  totalPercent,
  size = 110,
}: {
  circulatingPercent: number
  totalPercent: number
  size?: number
}) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const circOffset = circumference - (circulatingPercent / 100) * circumference
  const totalOffset = circumference - (totalPercent / 100) * circumference

  const colorBg = '#3f3f46' // ≈ oklch(0.274 0.006 286.033)
  const colorTotal = 'oklch(0.7 0.15 162 / 0.2)' // primary 20% opacity
  const colorCirc = 'oklch(0.7 0.15 162)' // primary solid

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
        {totalPercent > circulatingPercent && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={colorTotal}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={totalOffset}
            strokeLinecap='round'
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorCirc}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circOffset}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-base font-bold font-mono'>
          {circulatingPercent.toFixed(1)}%
        </span>
        <span className='text-[9px] text-muted-foreground uppercase tracking-wider'>
          Circulating
        </span>
      </div>
    </div>
  )
}

// === SKELETON RING (matches the real ring size) ===
function SupplyRingSkeleton({ size = 110 }: { size?: number }) {
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
          stroke='hsl(var(--muted))'
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
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {icon}
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className='h-6 w-28' />
      ) : (
        <p
          className={`text-base font-semibold font-mono tracking-tight ${warning ? 'text-orange-500' : ''}`}
        >
          {value}
        </p>
      )}
      {subvalue && (
        <p className='text-xs text-muted-foreground font-mono'>
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
          <p className='font-medium text-xs'>{leftLabel}</p>
          <p className='font-mono text-xs text-muted-foreground'>{leftValue}</p>
        </div>
        <div className='text-right'>
          <p className='font-medium text-xs'>{rightLabel}</p>
          <p className='font-mono text-xs text-muted-foreground'>
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

export function CoinTokenomics({ coin, isLoading }: CoinTokenomicsProps) {
  // === SKELETON STATE ===
  if (isLoading || !coin?.market_data) {
    return (
      <div className='rounded-lg border bg-background p-3 space-y-3'>
        {/* Header - hardcoded */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
              <Layers className='h-4 w-4' />
              Tokenomics
            </h2>
            <Info className='h-4 w-4 text-muted-foreground' />
          </div>
          <Badge variant='secondary' className='text-xs h-5 px-2 font-mono'>
            <Skeleton className='h-3 w-8 inline-block' />
          </Badge>
        </div>

        {/* Ring + Legend - hardcoded labels, skeleton values */}
        <div className='flex items-center gap-3'>
          <SupplyRingSkeleton size={110} />
          <div className='flex-1 space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-primary' />
                <span>Circulating</span>
              </div>
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-primary/30' />
                <span className='text-muted-foreground'>Locked / Vesting</span>
              </div>
              <Skeleton className='h-4 w-20' />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-muted border border-dashed border-muted-foreground/30' />
                <span className='text-muted-foreground'>Never issued</span>
              </div>
              <Skeleton className='h-4 w-20' />
            </div>
          </div>
        </div>

        {/* Metrics - hardcoded labels, skeleton values */}
        <div className='grid grid-cols-2 gap-2'>
          <MetricCard
            icon={<DollarSign className='h-3 w-3' />}
            label='Market Cap'
            value=''
            subvalue='Vol/MCap: —'
            isLoading={true}
          />
          <MetricCard
            icon={<Scale className='h-3 w-3' />}
            label='Fully Diluted Val'
            value=''
            subvalue='—x of MCap'
            isLoading={true}
          />
          <MetricCard
            icon={<Coins className='h-3 w-3' />}
            label='Total Supply'
            value=''
            subvalue='Max: —'
            isLoading={true}
          />
          <MetricCard
            icon={<Percent className='h-3 w-3' />}
            label='Circulating'
            value=''
            subvalue='— locked'
            isLoading={true}
          />
        </div>

        {/* Comparison Bar - hardcoded labels, skeleton bar */}
        <div className='space-y-1.5'>
          <div className='flex justify-between text-xs'>
            <div>
              <p className='font-medium text-xs'>Market Cap</p>
              <Skeleton className='h-3 w-24 mt-0.5' />
            </div>
            <div className='text-right'>
              <p className='font-medium text-xs'>Fully Diluted</p>
              <Skeleton className='h-3 w-24 mt-0.5 ml-auto' />
            </div>
          </div>
          <Skeleton className='h-2 w-full rounded-full' />
        </div>

        {/* Footer - hardcoded labels, skeleton values */}
        <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2'>
          <span className='flex items-center gap-1'>
            <TrendingUp className='h-3 w-3' />
            Price: <Skeleton className='h-3 w-16 inline-block' />
          </span>
          <span className='flex items-center gap-1'>
            <TrendingDown className='h-3 w-3' />
            Max MCAP: <Skeleton className='h-3 w-16 inline-block' />
          </span>
          <span className='flex items-center gap-1'>
            <DollarSign className='h-3 w-3' />
            24h Vol: <Skeleton className='h-3 w-16 inline-block' />
          </span>
        </div>
      </div>
    )
  }

  // === REAL DATA ===
  const {
    circulating_supply,
    total_supply,
    max_supply,
    market_cap,
    fully_diluted_valuation,
    current_price,
    total_volume,
  } = coin.market_data

  const symbol = coin.symbol.toUpperCase()

  // Calculations
  const maxSupply = max_supply ?? total_supply ?? circulating_supply ?? 0

  const circulatingPercent =
    maxSupply && circulating_supply
      ? Math.min((circulating_supply / maxSupply) * 100, 100)
      : 0

  const totalPercent =
    maxSupply && total_supply
      ? Math.min((total_supply / maxSupply) * 100, 100)
      : 0

  const lockedPercent = totalPercent - circulatingPercent
  const infiniteSupply = !max_supply && total_supply

  const fdv = fully_diluted_valuation?.usd || 0
  const mcap = market_cap?.usd || 0
  const fdvRatio = mcap && fdv ? fdv / mcap : 1

  const isHighDilution = fdvRatio > 2.5
  const isMediumDilution = fdvRatio > 1.5 && fdvRatio <= 2.5

  const mcapRank = coin.market_cap_rank
  const volume = total_volume?.usd
  const volumeToMcap = mcap && volume ? (volume / mcap) * 100 : 0

  return (
    <div className='rounded-lg border bg-background p-3 space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
            <Layers className='h-4 w-4' />
            Tokenomics & Supply
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <p className='text-xs leading-relaxed'>
                  Supply distribution and valuation metrics.{' '}
                  <span className='text-orange-500'>High FDV/MCAP</span> means
                  most tokens are not yet circulating — watch for unlocks.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {mcapRank && (
          <Badge variant='secondary' className='text-xs h-5 px-2 font-mono'>
            Rank #{mcapRank}
          </Badge>
        )}
      </div>

      {/* Ring + Legend */}
      <div className='flex items-center gap-3'>
        <SupplyRing
          circulatingPercent={circulatingPercent}
          totalPercent={totalPercent}
          size={110}
        />
        <div className='flex-1 space-y-1.5'>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-primary' />
              <span>Circulating</span>
            </div>
            <span className='font-mono text-sm'>
              {formatCompact(circulating_supply || 0)} {symbol}
            </span>
          </div>

          {total_supply && total_supply !== circulating_supply && (
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-primary/30' />
                <span className='text-muted-foreground'>Locked / Vesting</span>
              </div>
              <span className='font-mono text-sm text-muted-foreground'>
                {formatCompact(total_supply - (circulating_supply || 0))}{' '}
                {symbol}
              </span>
            </div>
          )}

          {max_supply && (
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-muted border border-dashed border-muted-foreground/30' />
                <span className='text-muted-foreground'>Never issued</span>
              </div>
              <span className='font-mono text-sm text-muted-foreground'>
                {formatCompact(
                  max_supply - (total_supply || circulating_supply || 0),
                )}{' '}
                {symbol}
              </span>
            </div>
          )}

          {infiniteSupply && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Unlock className='h-3.5 w-3.5' />
              <span className='text-xs'>No max supply — inflationary</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          icon={<DollarSign className='h-3 w-3' />}
          label='Market Cap'
          value={formatCurrency(mcap)}
          subvalue={
            volumeToMcap > 0
              ? `Vol/MCap: ${volumeToMcap.toFixed(1)}%`
              : undefined
          }
        />
        <MetricCard
          icon={<Scale className='h-3 w-3' />}
          label='Fully Diluted Val'
          value={formatCurrency(fdv)}
          subvalue={
            fdvRatio > 1 ? `${fdvRatio.toFixed(2)}x of MCap` : undefined
          }
          warning={isHighDilution}
        />
        <MetricCard
          icon={<Coins className='h-3 w-3' />}
          label='Total Supply'
          value={formatCompact(total_supply || circulating_supply || 0)}
          subvalue={
            max_supply ? `Max: ${formatCompact(max_supply)}` : 'Unlimited'
          }
        />
        <MetricCard
          icon={<Percent className='h-3 w-3' />}
          label='Circulating'
          value={formatPercent(circulatingPercent)}
          subvalue={
            lockedPercent > 0
              ? `${formatPercent(lockedPercent)} locked`
              : 'Fully unlocked'
          }
          accent={circulatingPercent >= 80}
        />
      </div>

      {/* Comparison Bar */}
      {fdv > 0 && mcap > 0 && (
        <ComparisonBar
          leftLabel='Market Cap'
          leftValue={formatCurrency(mcap)}
          rightLabel='Fully Diluted'
          rightValue={formatCurrency(fdv)}
          leftPercent={(mcap / fdv) * 100}
          color={
            isHighDilution ? 'orange' : isMediumDilution ? 'emerald' : 'primary'
          }
        />
      )}

      {/* Warnings */}
      {isHighDilution && (
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-orange-500 shrink-0' />
            <p className='font-semibold text-orange-500 text-sm'>
              High dilution — {fdvRatio.toFixed(1)}x
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
            Most tokens not yet circulating. Future unlocks may create selling
            pressure.
          </p>
          {lockedPercent > 0 && (
            <div className='pl-6 flex items-center gap-1.5 text-xs'>
              <Lock className='h-3 w-3 text-orange-500' />
              <span className='text-orange-500 font-mono'>
                {formatPercent(lockedPercent)} still locked
              </span>
            </div>
          )}
        </div>
      )}

      {isMediumDilution && (
        <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0' />
            <p className='font-semibold text-yellow-600 dark:text-yellow-500 text-sm'>
              Moderate dilution — {fdvRatio.toFixed(1)}x
            </p>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
            Meaningful supply remains locked. Monitor unlock schedules.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2'>
        <span className='flex items-center gap-1'>
          <TrendingUp className='h-3 w-3' />
          Price:{' '}
          <span className='font-mono text-foreground'>
            ${current_price?.usd?.toLocaleString()}
          </span>
        </span>
        {max_supply && current_price?.usd && (
          <span className='flex items-center gap-1'>
            <BarChart3 className='h-3 w-3' />
            Max MCAP:{' '}
            <span className='font-mono text-foreground'>
              ${formatCompact(max_supply * current_price.usd)}
            </span>
          </span>
        )}
        {volume && (
          <span className='flex items-center gap-1'>
            <DollarSign className='h-3 w-3' />
            24h Vol:{' '}
            <span className='font-mono text-foreground'>
              ${formatCompact(volume)}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
