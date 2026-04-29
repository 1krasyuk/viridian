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

type PricePresetButtonProps = {
  label: string
  value: number
  icon?: React.ReactNode
  active: boolean
  onClick: () => void
}

function PricePresetButton({
  label,
  value,
  icon,
  active,
  onClick,
}: PricePresetButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size='sm'
      className='text-xs gap-1.5 px-2.5'
      onClick={onClick}
    >
      {icon}
      {label}
      <span className='font-mono opacity-70'>
        ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)}
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
}

function TimePresetButton({
  period,
  label,
  coin,
  currentPrice,
  buyPrice,
  setBuyPrice,
}: TimePresetButtonProps) {
  const raw =
    coin?.market_data?.[
      `price_change_percentage_${period}_in_currency` as keyof typeof coin.market_data
    ]

  const percent =
    typeof raw === 'object' && raw !== null
      ? (raw as Record<string, number>).usd
      : undefined

  if (!percent || !currentPrice) return null

  const price = Math.round(currentPrice / (1 + percent / 100))

  return (
    <PricePresetButton
      label={label}
      value={price}
      icon={<Clock className='h-3 w-3' />}
      active={buyPrice === String(price)}
      onClick={() => setBuyPrice(String(price))}
    />
  )
}

export function CoinRoiCalculator({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  const currentPrice = coin?.market_data?.current_price?.usd
  const ath = coin?.market_data?.ath?.usd
  const atl = coin?.market_data?.atl?.usd

  const getPercent = (key: string): number | undefined => {
    const raw =
      coin?.market_data?.[
        `price_change_percentage_${key}_in_currency` as keyof typeof coin.market_data
      ]
    return typeof raw === 'object' && raw !== null
      ? (raw as Record<string, number>).usd
      : undefined
  }

  const getHistoricalPrice = (percent: number | undefined): number | null => {
    if (percent == null || !currentPrice) return null
    return currentPrice / (1 + percent / 100)
  }

  const default24h = Math.round(getHistoricalPrice(getPercent('24h')) ?? 0)

  const [investment, setInvestment] = useState('1000')
  const [buyPrice, setBuyPrice] = useState(() =>
    default24h > 0 ? String(default24h) : '',
  )

  const priceKey = currentPrice
    ? `price-${Math.round(currentPrice)}-${default24h}`
    : 'loading'

  if (isLoading) {
    return (
      <div className='rounded-lg border bg-card p-4 space-y-3'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    )
  }

  const investNum = parseFloat(investment) || 0
  const buyNum = parseFloat(buyPrice) || 0
  const currentNum = currentPrice || 0

  const coins = buyNum > 0 ? investNum / buyNum : 0
  const valueNow = coins * currentNum
  const profit = valueNow - investNum
  const roi = investNum > 0 ? (profit / investNum) * 100 : 0

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: n >= 1000 ? 0 : 2,
    }).format(n)

  const formatInvestment = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n)

  const isActive = (value: number) => buyPrice === String(Math.round(value))

  return (
    <div key={priceKey} className='rounded-lg border bg-card p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2'>
            <Calculator className='h-4 w-4' />
            ROI Calculator
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                <p className='text-xs leading-relaxed'>
                  Enter how much you invested and at what price you bought.
                  Calculates your profit or loss if you sold at the current
                  price. Use preset buttons to quickly set historical prices
                  (ATH, ATL, or past periods).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 rounded-full'
          onClick={() => {
            setInvestment('1000')
            setBuyPrice(default24h > 0 ? String(default24h) : '')
          }}
        >
          <RotateCcw className='h-3 w-3' />
        </Button>
      </div>

      <div className='space-y-3'>
        {/* Investment */}
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground font-medium'>
            Investment ($)
          </label>
          <Input
            type='number'
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className='h-9 font-mono'
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
                ${formatInvestment(preset)}
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
            className='h-9 font-mono'
            placeholder={default24h > 0 ? String(default24h) : '0'}
          />
        </div>

        {/* Price presets */}
        <div className='flex flex-wrap gap-1.5'>
          {[
            { period: '1h', label: '1H' },
            { period: '24h', label: '24H' },
            { period: '7d', label: '7D' },
            { period: '14d', label: '14D' },
            { period: '30d', label: '30D' },
            { period: '60d', label: '60D' },
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
            />
          ))}
          {ath && (
            <PricePresetButton
              label='ATH'
              value={ath}
              icon={<TrendingUp className='h-3 w-3' />}
              active={isActive(ath)}
              onClick={() => setBuyPrice(String(Math.round(ath)))}
            />
          )}
          {atl && (
            <PricePresetButton
              label='ATL'
              value={atl}
              icon={<TrendingDown className='h-3 w-3' />}
              active={isActive(atl)}
              onClick={() => setBuyPrice(String(Math.round(atl)))}
            />
          )}
        </div>

        {/* Results */}
        <div className='rounded-md bg-muted/50 p-3 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Coins bought</span>
            <span className='font-mono font-semibold'>
              {coins > 0 ? coins.toFixed(coins < 0.01 ? 6 : 4) : '—'}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Current value</span>
            <span className='font-mono font-semibold'>
              {valueNow > 0 ? formatCurrency(valueNow) : '—'}
            </span>
          </div>
          <div className='h-px bg-border' />
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Profit / Loss</span>
            <span
              className={`font-mono font-bold ${
                profit >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {profit >= 0 ? '+' : '−'}
              {formatCurrency(Math.abs(profit))}
              <span className='text-xs ml-1.5 opacity-70'>
                ({roi >= 0 ? '+' : '−'}
                {Math.abs(roi).toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
