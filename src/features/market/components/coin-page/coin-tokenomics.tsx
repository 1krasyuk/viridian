// features/market/components/coin-page/coin-tokenomics.tsx
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Progress } from '@/shared/ui/progress'
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
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString()
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

export function CoinTokenomics({ coin, isLoading }: CoinTokenomicsProps) {
  if (isLoading || !coin?.market_data) {
    return (
      <div className='rounded-lg border bg-background p-4 space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-5 w-40' />
        </div>
        <div className='space-y-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-20' />
              </div>
              <Skeleton className='h-2.5 w-full' />
              <Skeleton className='h-3 w-16 ml-auto' />
            </div>
          ))}
        </div>
        <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </div>
      </div>
    )
  }

  const {
    circulating_supply,
    total_supply,
    max_supply,
    market_cap,
    fully_diluted_valuation,
    current_price,
  } = coin.market_data

  const symbol = coin.symbol.toUpperCase()

  // Расчёты с null-safety
  const maxSupply = max_supply ?? total_supply ?? circulating_supply ?? 0

  const circulatingPercent =
    maxSupply && circulating_supply
      ? Math.min((circulating_supply / maxSupply) * 100, 100)
      : 0

  const totalPercent =
    maxSupply && total_supply
      ? Math.min((total_supply / maxSupply) * 100, 100)
      : 0

  const fdv = fully_diluted_valuation?.usd || 0
  const mcap = market_cap?.usd || 0
  const fdvRatio = mcap && fdv ? fdv / mcap : 1

  const isHighDilution = fdvRatio > 2.5
  const isMediumDilution = fdvRatio > 1.5 && fdvRatio <= 2.5

  return (
    <div className='rounded-lg border bg-background p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold uppercase flex items-center gap-2'>
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
                  Supply distribution and dilution analysis.{' '}
                  <span className='text-orange-500'>High dilution</span> means
                  significant token unlocks ahead — be cautious with long-term
                  holdings.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isHighDilution && (
          <Badge variant='destructive' className='text-[10px] h-5 px-1.5 gap-1'>
            <AlertTriangle className='w-3 h-3' />
            High Dilution
          </Badge>
        )}
      </div>

      {/* Supply Progress Bars */}
      <div className='space-y-5'>
        {/* Circulating Supply */}
        <div>
          <div className='flex justify-between text-sm mb-2'>
            <span className='font-medium'>Circulating Supply</span>
            <span className='font-mono text-sm'>
              {circulating_supply?.toLocaleString()}{' '}
              <span className='text-muted-foreground text-xs'>{symbol}</span>
            </span>
          </div>
          <Progress value={circulatingPercent} className='h-2.5' />
          <div className='text-right text-[11px] text-muted-foreground mt-1 font-mono'>
            {circulatingPercent.toFixed(1)}% of max
          </div>
        </div>

        {/* Total Supply */}
        {total_supply && total_supply !== circulating_supply && (
          <div>
            <div className='flex justify-between text-sm mb-2'>
              <span className='font-medium'>Total Supply</span>
              <span className='font-mono text-sm'>
                {total_supply.toLocaleString()}{' '}
                <span className='text-muted-foreground text-xs'>{symbol}</span>
              </span>
            </div>
            <Progress value={totalPercent} className='h-2.5' />
            <div className='text-right text-[11px] text-muted-foreground mt-1 font-mono'>
              {totalPercent.toFixed(1)}% of max
            </div>
          </div>
        )}

        {/* Max Supply */}
        {max_supply && (
          <div>
            <div className='flex justify-between text-sm mb-2'>
              <span className='font-medium'>Maximum Supply</span>
              <span className='font-mono text-sm font-semibold'>
                {max_supply.toLocaleString()}{' '}
                <span className='text-muted-foreground text-xs'>{symbol}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FDV & Market Cap */}
      <div className='grid grid-cols-2 gap-3 pt-4 border-t'>
        <div className='rounded-md bg-sidebar p-3 space-y-1'>
          <p className='text-xs text-muted-foreground flex items-center gap-1'>
            <TrendingUp className='h-3 w-3' />
            Market Cap
          </p>
          <p className='text-xl font-semibold font-mono tracking-tight'>
            {formatCurrency(mcap)}
          </p>
        </div>

        <div
          className={`rounded-md p-3 space-y-1 ${
            isHighDilution
              ? 'bg-orange-500/10 border border-orange-500/20'
              : isMediumDilution
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-sidebar'
          }`}
        >
          <p className='text-xs text-muted-foreground flex items-center gap-1'>
            <TrendingDown className='h-3 w-3' />
            Fully Diluted Valuation
            {isHighDilution && (
              <AlertTriangle className='w-3 h-3 text-orange-500' />
            )}
          </p>
          <p className='text-xl font-semibold font-mono tracking-tight'>
            {formatCurrency(fdv)}
          </p>
          <p className='text-[11px] text-muted-foreground font-mono'>
            {fdvRatio.toFixed(2)}x of MCAP
          </p>
        </div>
      </div>

      {/* Dilution Warning */}
      {isHighDilution && (
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-sm'>
          <div className='flex gap-2 items-start'>
            <AlertTriangle className='w-4 h-4 text-orange-500 mt-0.5 shrink-0' />
            <div>
              <p className='font-medium text-orange-500 text-sm'>
                High future dilution risk
              </p>
              <p className='text-muted-foreground text-xs mt-0.5 leading-relaxed'>
                FDV is {fdvRatio.toFixed(1)}x higher than market cap. A large
                portion of tokens is still locked and may unlock in the future,
                creating selling pressure.
              </p>
            </div>
          </div>
        </div>
      )}

      {isMediumDilution && (
        <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm'>
          <div className='flex gap-2 items-start'>
            <AlertTriangle className='w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0' />
            <div>
              <p className='font-medium text-yellow-600 dark:text-yellow-500 text-sm'>
                Moderate dilution risk
              </p>
              <p className='text-muted-foreground text-xs mt-0.5 leading-relaxed'>
                FDV is {fdvRatio.toFixed(1)}x of market cap. Some unlocked
                supply remains — monitor unlock schedules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className='text-[11px] text-muted-foreground border-t pt-3 flex flex-wrap gap-x-3 gap-y-1'>
        <span>
          Price:{' '}
          <span className='font-mono'>
            ${current_price?.usd?.toLocaleString()}
          </span>
        </span>
        {max_supply && current_price?.usd && (
          <span>
            Max MCAP:{' '}
            <span className='font-mono'>
              ${formatCompact(max_supply * current_price.usd)}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
