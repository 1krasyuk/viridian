// features/market/components/coin-page/coin-scenario-planner.tsx
import { useState, useMemo } from 'react'
import {
  Target,
  AlertTriangle,
  Info,
  TrendingUp,
  DollarSign,
  Scale,
  Rocket,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '@/features/market/types/coin'

interface CoinScenarioPlannerProps {
  coin: Coin | undefined
  isLoading: boolean
}

const QUICK_TARGETS = [
  { label: '2x', mult: 2, desc: 'Solid gain' },
  { label: '5x', mult: 5, desc: 'Bull run' },
  { label: '10x', mult: 10, desc: 'Moonshot' },
  { label: 'ATH', mult: 0, desc: 'All time high' },
]

function formatCurrency(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 4,
  }).format(n)
}

function formatCompact(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (Math.abs(n) >= 1_000_000_000_000)
    return (n / 1_000_000_000_000).toFixed(2) + 'T'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

// Get contextual comparison for a market cap
function getMcapContext(targetMcapB: number): {
  text: string
  realistic: 'high' | 'medium' | 'low'
} {
  if (targetMcapB <= 100)
    return { text: 'Small-cap territory', realistic: 'high' }
  if (targetMcapB <= 500)
    return { text: 'Mid-cap, achievable', realistic: 'high' }
  if (targetMcapB <= 1600)
    return { text: 'Needs top 10 crypto status', realistic: 'medium' }
  if (targetMcapB <= 3500)
    return { text: 'Must surpass Apple', realistic: 'medium' }
  if (targetMcapB <= 16000)
    return { text: 'Must surpass Gold', realistic: 'low' }
  return { text: 'Larger than Gold + Apple combined', realistic: 'low' }
}

// Compact metric card
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
            ? 'bg-primary/5 border border-primary/20'
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
          className={`text-base font-semibold font-mono tracking-tight ${warning ? 'text-orange-500' : accent ? 'text-primary' : ''}`}
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

export function CoinScenarioPlanner({
  coin,
  isLoading,
}: CoinScenarioPlannerProps) {
  const [multiplier, setMultiplier] = useState(5)
  const [investment, setInvestment] = useState('1000')
  const [customPrice, setCustomPrice] = useState('')

  const currentPrice = coin?.market_data?.current_price?.usd || 0
  const currentMcap = coin?.market_data?.market_cap?.usd || 0
  const ath = coin?.market_data?.ath?.usd || 0
  const mcapRank = coin?.market_cap_rank

  // Calculate target based on custom price or multiplier
  const targetPrice = useMemo(() => {
    if (customPrice && parseFloat(customPrice) > 0) {
      return parseFloat(customPrice)
    }
    return currentPrice * multiplier
  }, [customPrice, currentPrice, multiplier])

  const actualMultiplier = useMemo(() => {
    return currentPrice > 0 ? targetPrice / currentPrice : 0
  }, [targetPrice, currentPrice])

  const targetMcap = useMemo(() => {
    return currentMcap > 0 ? currentMcap * actualMultiplier : 0
  }, [currentMcap, actualMultiplier])

  const investAmount = parseFloat(investment) || 0
  const profit = investAmount > 0 ? investAmount * (actualMultiplier - 1) : 0
  const roi = investAmount > 0 ? (actualMultiplier - 1) * 100 : 0

  const context = getMcapContext(targetMcap / 1_000_000_000)

  // SKELETON STATE
  if (isLoading || !coin?.market_data) {
    return (
      <div className='rounded-lg border bg-background p-3 space-y-3'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
              <Rocket className='h-4 w-4' />
              Price Target
            </h2>
            <Info className='h-4 w-4 text-muted-foreground' />
          </div>
          <Badge variant='secondary' className='text-xs h-5 px-2 font-mono'>
            <Skeleton className='h-3 w-8 inline-block' />
          </Badge>
        </div>

        {/* Investment input skeleton */}
        <div className='space-y-1'>
          <p className='text-[11px] text-muted-foreground'>
            Your Investment ($)
          </p>
          <Skeleton className='h-9 w-full' />
        </div>

        {/* Target controls skeleton */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Target Price</span>
          <Skeleton className='h-7 w-24' />
        </div>
        <Skeleton className='h-5 w-full' />

        {/* Quick buttons */}
        <div className='flex flex-wrap gap-1.5'>
          {QUICK_TARGETS.map((t) => (
            <Button
              key={t.label}
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              disabled
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-2 gap-2'>
          <MetricCard
            icon={<DollarSign className='h-3 w-3' />}
            label='Current'
            value=''
            isLoading
          />
          <MetricCard
            icon={<Target className='h-3 w-3' />}
            label='Target'
            value=''
            accent
            isLoading
          />
          <MetricCard
            icon={<TrendingUp className='h-3 w-3' />}
            label='Profit'
            value=''
            accent
            isLoading
          />
          <MetricCard
            icon={<Scale className='h-3 w-3' />}
            label='Target MCAP'
            value=''
            isLoading
          />
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-lg border bg-background p-3 space-y-3'>
      {/* Header with tooltip */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold uppercase flex items-center gap-2'>
            <Rocket className='h-4 w-4' />
            Price Target
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <div className='text-xs leading-relaxed space-y-2'>
                  <p className='font-semibold text-primary'>Plan your exit</p>
                  <p>
                    Set a price target to see what market cap your coin would
                    need, how much profit you would make, and how realistic that
                    target is.
                  </p>
                  <p className='text-muted-foreground'>
                    Compares target market cap against Bitcoin, Apple, and Gold
                    to give you a reality check.
                  </p>
                </div>
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
      {/* Investment Input */}
      <div className='space-y-1'>
        <label className='text-[11px] text-muted-foreground font-medium'>
          Your Investment ($)
        </label>
        <Input
          type='number'
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          className='h-9 font-mono text-sm'
          placeholder='1000'
        />
      </div>
      {/* Target Price Display */}
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>Target Price</span>
        <span className='font-mono text-lg font-bold text-primary'>
          {formatCurrency(targetPrice)}
        </span>
      </div>
      Slider
      <Slider
        value={[actualMultiplier > 50 ? 50 : actualMultiplier]}
        onValueChange={(v) => {
          setMultiplier(v[0])
          setCustomPrice('')
        }}
        min={1.1}
        max={50}
        step={0.1}
      />
      {/* Quick Target Buttons */}
      <div className='flex flex-wrap gap-1.5'>
        {QUICK_TARGETS.map((t) => {
          const isActive =
            t.mult === 0
              ? ath > 0 && Math.abs(targetPrice - ath) < 0.01
              : multiplier === t.mult && !customPrice

          return (
            <Button
              key={t.label}
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='h-7 text-xs'
              onClick={() => {
                if (t.mult === 0 && ath > 0) {
                  setCustomPrice(String(ath))
                } else {
                  setMultiplier(t.mult)
                  setCustomPrice('')
                }
              }}
            >
              {t.label}
            </Button>
          )
        })}
      </div>
      {/* Custom Price Input */}
      <div className='space-y-1'>
        <label className='text-[11px] text-muted-foreground font-medium'>
          Or enter exact target price ($)
        </label>
        <Input
          type='number'
          step='0.000001'
          value={customPrice}
          onChange={(e) => setCustomPrice(e.target.value)}
          placeholder={`Current: ${formatCurrency(currentPrice)}`}
          className='h-9 font-mono text-sm'
        />
      </div>
      {/* Results Grid */}
      <div className='grid grid-cols-2 gap-2'>
        <MetricCard
          icon={<DollarSign className='h-3 w-3' />}
          label='Current Price'
          value={formatCurrency(currentPrice)}
          subvalue={`MCAP: ${formatCompact(currentMcap)}`}
        />
        <MetricCard
          icon={<Target className='h-3 w-3' />}
          label='Target Price'
          value={formatCurrency(targetPrice)}
          subvalue={`${actualMultiplier.toFixed(1)}x from now`}
          accent
        />
        <MetricCard
          icon={<TrendingUp className='h-3 w-3' />}
          label='Your Profit'
          value={
            profit >= 0 ? `+${formatCurrency(profit)}` : formatCurrency(profit)
          }
          subvalue={
            roi !== 0
              ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`
              : undefined
          }
          accent={profit > 0}
        />
        <MetricCard
          icon={<Scale className='h-3 w-3' />}
          label='Target MCAP'
          value={formatCompact(targetMcap)}
          subvalue={context.text}
          warning={context.realistic === 'low'}
        />
      </div>
      {/* Reality Check */}
      <div
        className={`rounded-lg p-2.5 space-y-1.5 ${
          context.realistic === 'high'
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : context.realistic === 'medium'
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-orange-500/10 border border-orange-500/20'
        }`}
      >
        <div className='flex items-center gap-2'>
          {context.realistic === 'low' ? (
            <AlertTriangle className='w-4 h-4 text-orange-500 shrink-0' />
          ) : context.realistic === 'medium' ? (
            <AlertTriangle className='w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0' />
          ) : (
            <TrendingUp className='w-4 h-4 text-emerald-500 shrink-0' />
          )}
          <p
            className={`font-semibold text-sm ${
              context.realistic === 'high'
                ? 'text-emerald-500'
                : context.realistic === 'medium'
                  ? 'text-yellow-600 dark:text-yellow-500'
                  : 'text-orange-500'
            }`}
          >
            {context.realistic === 'high'
              ? 'Realistic Target'
              : context.realistic === 'medium'
                ? 'Ambitious Target'
                : 'Very Ambitious'}
          </p>
        </div>
        <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
          {context.text}.
          {targetMcap > 0 && currentMcap > 0 && (
            <span>
              {' '}
              Needs {formatCompact(targetMcap / (currentMcap || 1))}x market cap
              growth.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
