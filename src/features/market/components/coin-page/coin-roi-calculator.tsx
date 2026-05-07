import { useState } from 'react'
import {
  Calculator,
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Info,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '../../types/coin'

const INVESTMENT_PRESETS = [
  1000, 2500, 5000, 10000, 15000, 30000, 50000, 100000,
]

function formatCompact(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toFixed(0)
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n)
}

function getHistoricalPrice(
  currentPrice: number | undefined,
  percent: number | null | undefined,
): number | null {
  if (percent == null || !currentPrice) return null
  return currentPrice / (1 + percent / 100)
}

type PricePresetButtonProps = {
  label: string
  value?: number
  icon?: React.ReactNode
  active: boolean
  onClick: () => void
  isLoading?: boolean
}

function PricePresetButton({
  label,
  value,
  icon,
  active,
  onClick,
  isLoading = false,
}: PricePresetButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size='sm'
      className='h-7 text-xs gap-1.5 px-2.5'
      onClick={onClick}
      disabled={isLoading}
    >
      {icon}
      {label}
      <span className='font-mono opacity-70'>
        {isLoading || value === undefined ? (
          <Skeleton className='h-3.5 w-10 inline-block' />
        ) : (
          `$${formatCompact(value)}`
        )}
      </span>
    </Button>
  )
}

type TimePresetButtonProps = {
  period: string
  label: string
  coin: Coin | undefined
  currentPrice: number | undefined
  buyPrice: string
  setBuyPrice: (value: string) => void
  isLoading: boolean
}

function TimePresetButton({
  period,
  label,
  coin,
  currentPrice,
  buyPrice,
  setBuyPrice,
  isLoading,
}: TimePresetButtonProps) {
  if (isLoading) {
    return (
      <PricePresetButton
        label={label}
        icon={<Clock className='h-3 w-3' />}
        active={false}
        onClick={() => {}}
        isLoading={true}
      />
    )
  }

  const raw =
    coin?.market_data?.[
      `price_change_percentage_${period}_in_currency` as keyof typeof coin.market_data
    ]

  const percent =
    typeof raw === 'object' && raw !== null
      ? (raw as Record<string, number>).usd
      : undefined

  const price = getHistoricalPrice(currentPrice, percent)
  if (!price) return null

  const rounded = Math.round(price)

  return (
    <PricePresetButton
      label={label}
      value={rounded}
      icon={<Clock className='h-3 w-3' />}
      active={buyPrice === String(rounded)}
      onClick={() => setBuyPrice(String(rounded))}
    />
  )
}

export function CoinRoiCalculator({
  coin,
  isLoading = false,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  const currentPrice = coin?.market_data?.current_price?.usd
  const ath = coin?.market_data?.ath?.usd
  const atl = coin?.market_data?.atl?.usd

  const raw24h = coin?.market_data?.price_change_percentage_24h_in_currency
  const percent24h =
    typeof raw24h === 'object' && raw24h !== null
      ? (raw24h as Record<string, number>).usd
      : undefined

  const [investment, setInvestment] = useState('1000')
  const [buyPrice, setBuyPrice] = useState('')

  const default24h = getHistoricalPrice(currentPrice, percent24h)

  if (default24h && !buyPrice) {
    setBuyPrice(String(Math.round(default24h)))
  }

  const investNum = parseFloat(investment) || 0
  const buyNum = parseFloat(buyPrice) || 0
  const currentNum = currentPrice || 0

  const coins = buyNum > 0 ? investNum / buyNum : 0
  const valueNow = coins * currentNum
  const profit = valueNow - investNum
  const roi = investNum > 0 ? (profit / investNum) * 100 : 0

  const isActive = (value: number) => buyPrice === String(Math.round(value))

  const handleReset = () => {
    setInvestment('1000')
    if (default24h) {
      setBuyPrice(String(Math.round(default24h)))
    } else {
      setBuyPrice('')
    }
  }

  return (
    <div className='rounded-lg border bg-background p-2 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold uppercase flex items-center gap-2'>
            <Calculator className='h-4 w-4' />
            ROI Calculator
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <p className='text-xs leading-relaxed'>
                  Enter your <span className='underline'>investment</span> and{' '}
                  <span className='underline'>buy price</span> to see{' '}
                  <span className='text-emerald-500'>profit</span>/
                  <span className='text-destructive'>loss</span> at current
                  price. Use presets for quick historical prices.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 rounded-full'
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className='h-3 w-3' />
        </Button>
      </div>

      <div className='space-y-3'>
        {/* Investment */}
        <div className='space-y-3'>
          <label className='text-xs text-muted-foreground font-medium'>
            Investment ($)
          </label>
          <Input
            type='number'
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className='h-9 font-mono rounded-md'
            placeholder='1000'
          />
          <div className='flex flex-wrap gap-1'>
            {INVESTMENT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={investment === String(preset) ? 'default' : 'outline'}
                size='sm'
                className='h-6 text-xs px-2 font-mono'
                onClick={() => setInvestment(String(preset))}
              >
                ${formatCompact(preset)}
              </Button>
            ))}
          </div>
        </div>

        {/* Buy Price */}
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground font-medium'>
            Buy Price ($)
          </label>
          <Input
            type='number'
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className='h-9 font-mono rounded-md'
            placeholder={default24h ? String(Math.round(default24h)) : '0'}
            disabled={isLoading}
          />
        </div>

        {/* Price Presets */}
        <div className='flex flex-wrap gap-1.5'>
          {[
            { period: '1h', label: '1H' },
            { period: '24h', label: '24H' },
            { period: '7d', label: '7D' },
            { period: '14d', label: '14D' },
            { period: '30d', label: '30D' },
            { period: '60d', label: '60D' },
            { period: '200d', label: '200D' },
            { period: '1y', label: '1Y' },
          ].map(({ period, label }) => (
            <TimePresetButton
              key={period}
              period={period}
              label={label}
              coin={coin}
              currentPrice={currentPrice}
              buyPrice={buyPrice}
              setBuyPrice={setBuyPrice}
              isLoading={isLoading}
            />
          ))}

          {/* ATH */}
          <PricePresetButton
            label='ATH'
            value={isLoading ? undefined : ath}
            icon={<TrendingUp className='h-3 w-3' />}
            active={!isLoading && isActive(ath || 0)}
            onClick={() =>
              !isLoading && ath && setBuyPrice(String(Math.round(ath)))
            }
            isLoading={isLoading}
          />

          {/* ATL */}
          <PricePresetButton
            label='ATL'
            value={isLoading ? undefined : atl}
            icon={<TrendingDown className='h-3 w-3' />}
            active={!isLoading && isActive(atl || 0)}
            onClick={() =>
              !isLoading && atl && setBuyPrice(String(Math.round(atl)))
            }
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        <div className='rounded-md bg-sidebar p-3 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Coins bought</span>
            <span className='font-mono font-semibold'>
              {isLoading ? (
                <Skeleton className='h-5 w-20 inline-block' />
              ) : coins > 0 ? (
                coins.toFixed(coins < 0.01 ? 6 : 4)
              ) : (
                '—'
              )}
            </span>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Investment value</span>
            <span className='font-mono font-semibold'>
              {isLoading ? (
                <Skeleton className='h-5 w-24 inline-block' />
              ) : valueNow > 0 ? (
                formatCurrency(valueNow)
              ) : (
                '—'
              )}
            </span>
          </div>

          <div className='h-px bg-border' />

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Profit / Loss</span>
            <span className='font-mono font-bold'>
              {isLoading ? (
                <Skeleton className='h-6 w-28 inline-block' />
              ) : profit !== 0 ? (
                <>
                  <span
                    className={
                      profit >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }
                  >
                    {profit >= 0 ? '+' : '−'}
                    {formatCurrency(Math.abs(profit))}
                  </span>
                  <span className='text-xs ml-1.5 opacity-70'>
                    ({roi >= 0 ? '+' : '−'}
                    {Math.abs(roi).toFixed(1)}%)
                  </span>
                </>
              ) : (
                '—'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
