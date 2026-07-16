import { useState } from 'react'
import {
  Calculator,
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Info,
  ArrowRightLeft,
  Wallet,
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
import { useCurrency } from '@/features/currency/hooks'

const INVESTMENT_PRESETS = [
  1000, 2500, 5000, 10000, 15000, 30000, 50000, 100000,
]

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
  const { format } = useCurrency()

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size='sm'
      className={`h-8 text-xs gap-1.5 px-3 rounded-lg transition-all duration-200 ${
        active
          ? 'shadow-sm'
          : 'hover:bg-muted/80 hover:border-muted-foreground/20'
      }`}
      onClick={onClick}
      disabled={isLoading}
    >
      {icon}
      {label}
      <span className='font-mono opacity-70'>
        {isLoading || value === undefined ? (
          <Skeleton className='h-3.5 w-10 inline-block' />
        ) : (
          format(value, { notation: 'compact' })
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
  const { getValue } = useCurrency()

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
      ? (getValue(raw as Record<string, number>) ?? undefined)
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
  const { getValue, format, currency } = useCurrency()

  const currentPrice = getValue(coin?.market_data?.current_price) ?? undefined
  const ath = getValue(coin?.market_data?.ath) ?? undefined
  const atl = getValue(coin?.market_data?.atl) ?? undefined

  const raw24h = coin?.market_data?.price_change_percentage_24h_in_currency
  const percent24h =
    typeof raw24h === 'object' && raw24h !== null
      ? (getValue(raw24h as Record<string, number>) ?? undefined)
      : undefined

  const [investment, setInvestment] = useState('1000')
  const default24h = getHistoricalPrice(currentPrice, percent24h)

  const [buyPrice, setBuyPrice] = useState(() => {
    const default24h = getHistoricalPrice(
      getValue(coin?.market_data?.current_price) ?? undefined,
      getValue(
        coin?.market_data?.price_change_percentage_24h_in_currency as Record<
          string,
          number
        >,
      ) ?? undefined,
    )
    return default24h ? String(Math.round(default24h)) : ''
  })

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
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
          <Calculator className='h-4 w-4 text-emerald-500' />
        </div>
        <div>
          <h2 className='text-base font-bold tracking-tight'>ROI Calculator</h2>
          <p className='text-xs text-muted-foreground'>
            What if you bought at...
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
                  Enter your investment amount and buy price to calculate
                  potential profit or loss at the current market price.
                </p>
                <p className='text-muted-foreground'>
                  Use historical price presets to quickly simulate past entry
                  points and compare different timing strategies.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 rounded-lg hover:bg-muted ml-auto'
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className='h-3 w-3' />
        </Button>
      </div>

      <div className='space-y-4'>
        {/* Investment Section */}
        <div className='space-y-2.5'>
          <div className='flex items-center gap-2'>
            <Wallet className='h-3.5 w-3.5 text-muted-foreground' />
            <label className='text-sm font-medium text-muted-foreground'>
              Investment
            </label>
          </div>
          <div className='relative'>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono'>
                {currency.toUpperCase()}
              </span>
              <Input
                type='number'
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className='h-10 pl-10 font-mono text-sm rounded-xl bg-muted/30 border-muted-foreground/10 focus:bg-background transition-colors'
                placeholder={default24h ? String(Math.round(default24h)) : '0'}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {INVESTMENT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={investment === String(preset) ? 'default' : 'outline'}
                size='sm'
                className={`h-7 text-xs px-2.5 font-mono rounded-lg transition-all ${
                  investment === String(preset)
                    ? 'shadow-sm'
                    : 'bg-muted/20 border-muted-foreground/10 hover:bg-muted/40'
                }`}
                onClick={() => setInvestment(String(preset))}
              >
                {format(preset, { notation: 'compact' })}
              </Button>
            ))}
          </div>
        </div>

        {/* Buy Price Section */}
        <div className='space-y-2.5'>
          <div className='flex items-center gap-2'>
            <ArrowRightLeft className='h-3.5 w-3.5 text-muted-foreground' />
            <label className='text-sm font-medium text-muted-foreground'>
              Buy Price
            </label>
          </div>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono'>
              {currency.toUpperCase()}
            </span>
            <Input
              type='number'
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className='h-10 pl-10 font-mono text-sm rounded-xl bg-muted/30 border-muted-foreground/10 focus:bg-background transition-colors'
              placeholder={default24h ? String(Math.round(default24h)) : '0'}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Price Presets — grouped visually */}
        <div className='space-y-2'>
          <p className='text-xs font-medium text-muted-foreground capitalize tracking-wider'>
            Historical Prices
          </p>
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
        </div>

        {/* Results — styled as a prominent card */}
        <div className='rounded-2xl bg-linear-to-br from-muted/50 via-muted/30 to-background border border-border/50 p-4 space-y-3'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-sm font-semibold'>Results</span>
          </div>

          <div className='space-y-2.5'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground text-xs'>
                Coins bought
              </span>
              <span className='font-mono font-semibold text-sm'>
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
              <span className='text-muted-foreground text-xs'>
                Current value
              </span>
              <span className='font-mono font-semibold text-sm'>
                {isLoading ? (
                  <Skeleton className='h-5 w-24 inline-block' />
                ) : valueNow > 0 ? (
                  format(valueNow)
                ) : (
                  '—'
                )}
              </span>
            </div>

            <div className='h-px bg-linear-to-r from-transparent via-border to-transparent' />

            <div className='flex items-center justify-between'>
              <span className='text-sm font-bold'>Profit / Loss</span>
              <span className='font-mono font-bold text-base'>
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
                      {format(Math.abs(profit))}
                    </span>
                    <span className='text-xs ml-2 opacity-60 font-mono bg-muted/50 px-1.5 py-0.5 rounded-md'>
                      {roi >= 0 ? '+' : '−'}
                      {Math.abs(roi).toFixed(1)}%
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
    </div>
  )
}
