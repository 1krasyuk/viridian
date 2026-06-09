import {
  Layers,
  TrendingUp,
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
import { CoinMetricCard } from './shared/coin-metric-card'
import { ComparisonBar } from './shared/comparison-bar'
import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from './shared/formatters'

interface CoinTokenomicsProps {
  coin: Coin | undefined
  isLoading: boolean
}

// === SUPPLY RING ===
function SupplyCircleDiagram({
  circulatingPercent,
  totalPercent,
  size = 110,
  isLoading = false,
}: {
  circulatingPercent: number
  totalPercent: number
  size?: number
  isLoading?: boolean
}) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const circArc = Math.max(
    (Math.min(circulatingPercent, 100) / 100) * circumference,
    3,
  )
  const lockedPercent = Math.max(0, totalPercent - circulatingPercent)
  const lockedArc = Math.max(
    (Math.min(lockedPercent, 100) / 100) * circumference,
    3,
  )
  const circAngle = (circulatingPercent / 100) * 360

  const colorBg = 'var(--ring-bg)'
  const colorLocked = 'var(--ring-locked)'
  const colorCirc = 'var(--ring-circ)'

  if (isLoading) {
    return (
      <div
        className='relative inline-flex items-center justify-center shrink-0 [--ring-bg:#d4d4d8] dark:[--ring-bg:#3f3f46]'
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className='-rotate-90'>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 10) / 2}
            fill='none'
            stroke={colorBg}
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

  return (
    <div
      className='relative inline-flex items-center justify-center shrink-0 [--ring-bg:#d4d4d8] [--ring-locked:#10b98159] [--ring-circ:#10b981] dark:[--ring-bg:#3f3f46] dark:[--ring-locked:#34d39959] dark:[--ring-circ:#34d399]'
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
        {lockedPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={colorLocked}
            strokeWidth={strokeWidth}
            strokeDasharray={`${lockedArc} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap='butt'
            transform={`rotate(${circAngle} ${size / 2} ${size / 2})`}
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colorCirc}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circArc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap='butt'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-base font-bold font-mono'>
          {circulatingPercent.toFixed(1)}%
        </span>
        <span className='text-[9px] text-muted-foreground uppercase tracking-wider truncate'>
          Circulating
        </span>
      </div>
    </div>
  )
}

// === DILUTION WARNING ===
function DilutionWarning({
  level,
  ratio,
  lockedPercent,
}: {
  level: 'high' | 'medium'
  ratio: number
  lockedPercent: number
}) {
  const isHigh = level === 'high'
  return (
    <div
      className={`${isHigh ? 'bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20' : 'bg-linear-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20'} border rounded-xl p-3 space-y-1.5`}
    >
      <div className='flex items-center gap-2'>
        <AlertTriangle
          className={`w-4 h-4 shrink-0 ${isHigh ? 'text-orange-500' : 'text-amber-600 dark:text-amber-400'}`}
        />
        <p
          className={`font-semibold text-sm ${isHigh ? 'text-orange-500' : 'text-amber-600 dark:text-amber-400'}`}
        >
          {isHigh ? 'High' : 'Moderate'} dilution — {ratio.toFixed(1)}x
        </p>
      </div>
      <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
        {isHigh
          ? 'Most tokens not yet circulating. Future unlocks may create selling pressure.'
          : 'Meaningful supply remains locked. Monitor unlock schedules.'}
      </p>
      {isHigh && lockedPercent > 0 && (
        <div className='pl-6 flex items-center gap-1.5 text-xs'>
          <Lock className='h-3 w-3 text-orange-500' />
          <span className='text-orange-500 font-mono'>
            {formatPercent(lockedPercent)} still locked
          </span>
        </div>
      )}
    </div>
  )
}

export function CoinTokenomics({ coin, isLoading }: CoinTokenomicsProps) {
  const marketData = coin?.market_data
  const symbol = coin?.symbol?.toUpperCase() || ''
  const mcapRank = coin?.market_cap_rank

  const circulating_supply = marketData?.circulating_supply
  const total_supply = marketData?.total_supply
  const max_supply = marketData?.max_supply
  const mcap = marketData?.market_cap?.usd || 0
  const fdv = marketData?.fully_diluted_valuation?.usd || 0
  const current_price = marketData?.current_price?.usd || 0
  const volume = marketData?.total_volume?.usd || 0

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

  const fdvRatio = mcap && fdv ? fdv / mcap : 1
  const isHighDilution = fdvRatio > 2.5
  const isMediumDilution = fdvRatio > 1.5 && fdvRatio <= 2.5
  const volumeToMcap = mcap && volume ? (volume / mcap) * 100 : 0

  const showLocked = !isLoading
    ? total_supply && total_supply !== circulating_supply && lockedPercent > 0
    : true
  const showNeverIssued = !isLoading ? !!max_supply : true
  const showInfinite = !isLoading && infiniteSupply

  return (
    <TooltipProvider>
      <div className='bg-linear-to-br from-card/60 to-background/40 backdrop-blur-sm rounded-xl border border-border/30 p-4 space-y-4 h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
            <Layers className='h-4 w-4 text-emerald-500' />
          </div>
          <div>
            <h3 className='text-base font-bold tracking-tight'>
              Tokenomics & Supply
            </h3>
            <p className='text-xs text-muted-foreground'>
              Supply structure and valuation
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-default shrink-0  transition-colors' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <div className='text-xs leading-relaxed space-y-1.5'>
                  <p>
                    Token supply structure expressed as percentages, showing
                    circulating, locked, and unissued tokens as proportions of
                    maximum supply.
                  </p>
                  <p className='text-muted-foreground'>
                    Lower circulating percentages indicate higher dilution risk
                    from future token unlocks and emission events.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isLoading ? (
            <Badge
              variant='secondary'
              className='text-xs h-5 px-2 font-mono ml-auto'
            >
              <Skeleton className='h-3 w-8 inline-block' />
            </Badge>
          ) : mcapRank ? (
            <Badge
              variant='secondary'
              className='text-xs h-5 px-2 font-mono ml-auto'
            >
              Rank #{mcapRank}
            </Badge>
          ) : null}
        </div>

        {/* Ring + Legend */}
        <div className='flex items-center gap-3'>
          <SupplyCircleDiagram
            circulatingPercent={circulatingPercent}
            totalPercent={totalPercent}
            size={110}
            isLoading={isLoading}
          />
          <div className='flex-1 space-y-1.5'>
            {/* Circulating */}
            <div className='flex items-center justify-between text-sm gap-2 break-all'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400' />
                <span>Circulating</span>
              </div>
              {isLoading ? (
                <Skeleton className='h-4 w-24' />
              ) : (
                <span className='font-mono text-sm'>
                  {formatCompact(circulating_supply || 0)} {symbol}
                </span>
              )}
            </div>

            {/* Locked / Vesting */}
            {showLocked && (
              <div className='flex items-center justify-between text-sm break-all'>
                <div className='flex items-center gap-2'>
                  <div className='w-2.5 h-2.5 rounded-full bg-emerald-500/35 dark:bg-emerald-400/35' />
                  <span className='text-muted-foreground'>
                    Locked / Vesting
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className='h-4 w-20' />
                ) : (
                  <span className='font-mono text-sm text-muted-foreground'>
                    {formatCompact(
                      (total_supply || 0) - (circulating_supply || 0),
                    )}
                    {symbol}
                  </span>
                )}
              </div>
            )}

            {/* Never issued */}
            {showNeverIssued && (
              <div className='flex items-center justify-between text-sm gap-2 break-all'>
                <div className='flex items-center gap-2'>
                  <div className='w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600' />
                  <span className='text-muted-foreground'>Never issued</span>
                </div>
                {isLoading ? (
                  <Skeleton className='h-4 w-20' />
                ) : (
                  <span className='font-mono text-sm text-muted-foreground'>
                    {formatCompact(
                      (max_supply || 0) -
                        (total_supply || circulating_supply || 0),
                    )}
                    {symbol}
                  </span>
                )}
              </div>
            )}

            {/* Infinite supply note */}
            {showInfinite && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Unlock className='h-3.5 w-3.5' />
                <span className='text-xs'>No max supply — inflationary</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className='grid grid-cols-2 gap-2.5'>
          <CoinMetricCard
            icon={<DollarSign className='h-3 w-3 shrink-0' />}
            label='Market Cap'
            value={formatCurrency(mcap)}
            subvalue={
              volumeToMcap > 0
                ? `Vol/MCap: ${volumeToMcap.toFixed(1)}%`
                : 'No trading data'
            }
            isLoading={isLoading}
          />
          <CoinMetricCard
            icon={<Scale className='h-3 w-3  shrink-0' />}
            label='Fully Diluted Val'
            value={formatCurrency(fdv)}
            subvalue={`${fdvRatio.toFixed(2)}x of MCap`}
            warning={isHighDilution}
            isLoading={isLoading}
          />
          <CoinMetricCard
            icon={<Coins className='h-3 w-3  shrink-0' />}
            label='Total Supply'
            value={formatCompact(total_supply || circulating_supply || 0)}
            subvalue={
              max_supply
                ? `Max: ${formatCompact(max_supply)}`
                : infiniteSupply
                  ? 'Unlimited'
                  : 'Fixed supply'
            }
            isLoading={isLoading}
          />
          <CoinMetricCard
            icon={<Percent className='h-3 w-3  shrink-0' />}
            label='Circulating'
            value={formatPercent(circulatingPercent)}
            subvalue={
              lockedPercent > 0
                ? `${formatPercent(lockedPercent)} locked`
                : 'Fully unlocked'
            }
            accent={circulatingPercent >= 80}
            isLoading={isLoading}
          />
        </div>

        {/* Comparison Bar */}
        <ComparisonBar
          leftLabel='Market Cap'
          leftValue={formatCurrency(mcap)}
          rightLabel='Fully Diluted'
          rightValue={formatCurrency(fdv)}
          leftPercent={fdv > 0 ? (mcap / fdv) * 100 : 0}
          color={isHighDilution ? 'orange' : 'emerald'}
          isLoading={isLoading}
        />

        {/* Dilution Warnings */}
        {!isLoading && isHighDilution && (
          <DilutionWarning
            level='high'
            ratio={fdvRatio}
            lockedPercent={lockedPercent}
          />
        )}
        {!isLoading && isMediumDilution && (
          <DilutionWarning
            level='medium'
            ratio={fdvRatio}
            lockedPercent={lockedPercent}
          />
        )}

        {/* Footer */}
        <div className='mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2'>
          {[
            {
              icon: <TrendingUp className='h-3 w-3' />,
              label: 'Price',
              value: `$${current_price.toLocaleString()}`,
              show: !isLoading && current_price > 0,
            },
            {
              icon: <BarChart3 className='h-3 w-3' />,
              label: 'Max MCAP',
              value: `$${formatCompact((max_supply || 0) * current_price)}`,
              show: !isLoading && max_supply && current_price > 0,
            },
            {
              icon: <DollarSign className='h-3 w-3' />,
              label: '24h Vol',
              value: `$${formatCompact(volume)}`,
              show: !isLoading && volume > 0,
            },
          ]
            .filter((item) => item.show)
            .map((item, i) => (
              <span key={i} className='flex items-center gap-1'>
                {item.icon}
                <span className='text-muted-foreground'>{item.label}:</span>
                <span className='font-mono text-foreground'>{item.value}</span>
              </span>
            ))}
          {isLoading && (
            <>
              <span className='flex items-center gap-1'>
                <TrendingUp className='h-3 w-3' />
                <span className='text-muted-foreground'>Price:</span>
                <Skeleton className='h-3 w-16 inline-block' />
              </span>
              <span className='flex items-center gap-1'>
                <BarChart3 className='h-3 w-3' />
                <span className='text-muted-foreground'>Max MCAP:</span>
                <Skeleton className='h-3 w-16 inline-block' />
              </span>
              <span className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                <span className='text-muted-foreground'>24h Vol:</span>
                <Skeleton className='h-3 w-16 inline-block' />
              </span>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
