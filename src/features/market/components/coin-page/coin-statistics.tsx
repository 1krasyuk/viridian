import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '../../types/coin'
import { InfinityIcon, Info } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'

type Format = 'currency' | 'number' | 'percent' | 'suffix'

type StatCardProps = {
  label: string
  tooltip?: string
  value: number | null
  format?: Format
  isInfinite?: boolean
  change?: number | null
  suffix?: string
  isLoading?: boolean
}

function formatValue(value: number, format?: Format, suffix?: string) {
  switch (format) {
    case 'currency':
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      })
    case 'percent':
      return `${value.toFixed(2)}%`
    case 'suffix':
      return `${value.toLocaleString('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      })} ${suffix ?? ''}`
    default:
      return value.toLocaleString()
  }
}

function formatTooltipValue(
  value: number | null | undefined,
  format?: 'currency' | 'percent' | 'suffix' | 'number',
  suffix?: string,
) {
  if (value == null) return '--'
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString('en-US')}`
    case 'percent':
      return `${value.toFixed(5)}%`
    case 'suffix':
      return `${value.toLocaleString()} ${suffix || ''}`
    default:
      return value.toLocaleString()
  }
}

function ChangeBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={`inline-flex items-center font-bold text-xs ${
        isPositive ? 'text-emerald-500' : 'text-red-500'
      }`}
    >
      <span className='inline-block scale-x-150 scale-y-80 mr-1 text-xs'>
        {isPositive ? '▲' : '▼'}
      </span>
      {value.toFixed(2)}%
    </span>
  )
}

function StatCard({
  label,
  tooltip,
  value,
  isInfinite,
  format,
  change,
  suffix,
  isLoading,
}: StatCardProps) {
  const formattedValue = isInfinite ? (
    <InfinityIcon className='w-5 h-5' />
  ) : value == null ? (
    '—'
  ) : (
    formatValue(value, format, suffix)
  )

  return (
    <div className='flex flex-col items-center justify-between gap-1 p-2 border border-muted-foreground rounded-md w-full h-full text-center'>
      <TooltipProvider>
        <div className='flex items-center justify-center gap-1 text-muted-foreground font-bold text-sm w-full wrap-break-word'>
          <span>{label}</span>
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size='14' className='shrink-0' />
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <span className='whitespace-pre-line'>{tooltip}</span>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </TooltipProvider>

      <div className='flex items-center justify-center flex-wrap gap-2 w-full'>
        {isLoading ? (
          <Skeleton className='h-5 w-20' />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='font-bold text-sm cursor-default truncate'>
                  {formattedValue}
                </span>
              </TooltipTrigger>
              <TooltipContent className='text-xs' side='bottom'>
                <span className='whitespace-pre-line'>
                  {isInfinite ? (
                    <InfinityIcon className='w-4 h-4' />
                  ) : value == null ? (
                    '—'
                  ) : (
                    formatTooltipValue(value, format, suffix)
                  )}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!isLoading && change != null && <ChangeBadge value={change} />}
      </div>
    </div>
  )
}

export function CoinStatistics({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  if (!coin) {
    return (
      <div className='grid grid-cols-6 gap-2 items-stretch'>
        <div className='col-span-6'>
          <StatCard
            label='Market Cap'
            tooltip='The total market value of a cryptocurrency circulating supply.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-3'>
          <StatCard
            label='Volume (24h)'
            tooltip='A measure of how much of a cryptocurrency was traded in the last 24 hours.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-3'>
          <StatCard
            label='Vol/MCap (24h)'
            tooltip='Indicator of liquidity. Higher = more liquid and easier to trade.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-6'>
          <StatCard
            label='FDV'
            tooltip='Fully-diluted value (FDV) = price x max supply.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-2'>
          <StatCard
            label='Total supply'
            tooltip='Total coins created - burned.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-2'>
          <StatCard
            label='Max. supply'
            tooltip='Maximum number of coins that can ever exist.'
            value={null}
            isLoading
          />
        </div>
        <div className='col-span-2'>
          <StatCard
            label='Circ. supply'
            tooltip='Coins currently available on the market.'
            value={null}
            isLoading
          />
        </div>
      </div>
    )
  }

  const data = coin.market_data

  return (
    <div className='grid grid-cols-6 gap-2 items-stretch'>
      <div className='col-span-6'>
        <StatCard
          label='Market Cap'
          tooltip='The total market value of a cryptocurrency circulating supply.'
          value={data.market_cap.usd}
          format='currency'
          change={data.price_change_percentage_24h}
          isLoading={isLoading}
        />
      </div>

      <div className='col-span-3'>
        <StatCard
          label='Volume (24h)'
          tooltip='A measure of how much of a cryptocurrency was traded in the last 24 hours. Shows current market activity.'
          value={data.total_volume.usd}
          format='currency'
          isLoading={isLoading}
        />
      </div>
      <div className='col-span-3'>
        <StatCard
          label='Vol/MCap (24h)'
          tooltip='Indicator of liquidity. Higher = more liquid and easier to trade.'
          value={(data.total_volume.usd / data.market_cap.usd) * 100}
          format='percent'
          isLoading={isLoading}
        />
      </div>

      <div className='col-span-6'>
        <StatCard
          label='FDV'
          tooltip='Fully-diluted value (FDV) = price x max supply. Market cap if all coins were in circulation. Helps estimate potential future valuation.'
          value={data.fully_diluted_valuation.usd}
          format='currency'
          isLoading={isLoading}
        />
      </div>

      <div className='col-span-2'>
        <StatCard
          label='Total supply'
          tooltip='Total supply = Total coins created - coins that have been burned. Helps estimate potential future valuation.'
          value={data.total_supply}
          format='suffix'
          suffix={coin.symbol.toUpperCase()}
          isLoading={isLoading}
        />
      </div>
      <div className='col-span-2'>
        <StatCard
          label='Max. supply'
          tooltip='Maximum number of coins that can ever exist. ∞ means no fixed limit.'
          value={data.max_supply}
          isInfinite={data.max_supply_infinite}
          format='suffix'
          suffix={coin.symbol.toUpperCase()}
          isLoading={isLoading}
        />
      </div>
      <div className='col-span-2'>
        <StatCard
          label='Circ. supply'
          tooltip='Coins currently available on the market.'
          value={data.circulating_supply}
          format='suffix'
          suffix={coin.symbol.toUpperCase()}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
