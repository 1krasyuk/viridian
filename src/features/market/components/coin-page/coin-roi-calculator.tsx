// features/market/components/coin-page/coin-roi-calculator.tsx
import { useState } from 'react'
import {
  Calculator,
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Coin } from '../../types/coin'

type PeriodConfig = {
  label: string
  getPercent: (coin: Coin | undefined) => number | null | undefined
}

const PERIODS: PeriodConfig[] = [
  {
    label: '1H',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_1h_in_currency?.usd,
  },
  {
    label: '24H',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_24h_in_currency?.usd,
  },
  {
    label: '7D',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_7d_in_currency?.usd,
  },
  {
    label: '14D',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_14d_in_currency?.usd,
  },
  {
    label: '30D',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_30d_in_currency?.usd,
  },
  {
    label: '60D',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_60d_in_currency?.usd,
  },
  {
    label: '1Y',
    getPercent: (c) =>
      c?.market_data?.price_change_percentage_1y_in_currency?.usd,
  },
]

const INVESTMENT_PRESETS = [
  1000, 2500, 5000, 10000, 15000, 30000, 50000, 100000,
]

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

  const [investment, setInvestment] = useState('1000')
  const [buyPrice, setBuyPrice] = useState('')

  const default24h = currentPrice
    ? currentPrice /
      (1 +
        (coin?.market_data?.price_change_percentage_24h_in_currency?.usd ?? 0) /
          100)
    : null
  const priceKey = currentPrice
    ? `price-${Math.round(currentPrice)}-${Math.round(default24h ?? 0)}`
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

  const getHistoricalPrice = (
    percent: number | null | undefined,
  ): number | null => {
    if (percent == null || !currentPrice) return null
    return currentPrice / (1 + percent / 100)
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: n >= 1000 ? 0 : 2,
    }).format(n)

  const formatPriceLabel = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toFixed(0)

  const formatInvestment = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n)

  const presetPrices = [
    ...PERIODS.map((period) => {
      const price = getHistoricalPrice(period.getPercent(coin))
      return price
        ? {
            label: period.label,
            value: price,
            icon: <Clock className='h-3 w-3' />,
          }
        : null
    }).filter(Boolean),
    ...(ath
      ? [{ label: 'ATH', value: ath, icon: <TrendingUp className='h-3 w-3' /> }]
      : []),
    ...(atl
      ? [
          {
            label: 'ATL',
            value: atl,
            icon: <TrendingDown className='h-3 w-3' />,
          },
        ]
      : []),
  ] as { label: string; value: number; icon: React.ReactNode }[]

  return (
    <div
      key={priceKey}
      className='rounded-lg border bg-background p-2 space-y-4'
    >
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2'>
          <Calculator className='h-4 w-4' />
          ROI Calculator
        </h3>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 rounded-full'
          onClick={() => {
            setInvestment('1000')
            setBuyPrice(default24h ? String(Math.round(default24h)) : '')
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
            className='h-9 font-mono rounded-md'
            placeholder='1000'
          />
          {/* Investment presets */}
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
            className='h-9 font-mono rounded-md'
            placeholder={default24h ? String(Math.round(default24h)) : '0'}
          />
        </div>

        {/* Price presets */}
        {presetPrices.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {presetPrices.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  buyPrice === String(Math.round(preset.value))
                    ? 'default'
                    : 'outline'
                }
                size='sm'
                className='h-7 text-xs gap-1.5 px-2.5'
                onClick={() => setBuyPrice(String(Math.round(preset.value)))}
              >
                {preset.icon}
                {preset.label}
                <span className='font-mono opacity-70'>
                  ${formatPriceLabel(preset.value)}
                </span>
              </Button>
            ))}
          </div>
        )}

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
