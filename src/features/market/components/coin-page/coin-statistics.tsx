import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '../../types/coin'
import { Info } from 'lucide-react'

type Props = {
  coin: Coin
}

type Format = 'currency' | 'number' | 'percent' | 'suffix'

type StatCardProps = {
  label: string
  tooltip?: string
  value: number
  format?: Format
  change?: number | null
  suffix?: string
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
      return `${value.toLocaleString()}${suffix ?? ''}`
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
  format,
  change,
  suffix,
}: StatCardProps) {
  const formattedValue = formatValue(value, format, suffix)

  return (
    <div className='flex flex-col items-center gap-1 p-2 border border-ring rounded-md'>
      <TooltipProvider>
        <div className='flex items-center gap-1 text-muted-foreground text-sm'>
          {label}
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='inline-flex items-center gap-1'>
                  <Info size='14' />
                </span>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <span>{tooltip}</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span>{label}</span>
          )}
        </div>
      </TooltipProvider>

      <div className='flex items-center gap-2'>
        <span className='font-bold text-sm'>{formattedValue}</span>
        {change != null && <ChangeBadge value={change} />}
      </div>
    </div>
  )
}

export function CoinStatistics({ coin }: Props) {
  return (
    <div className='my-3 flex flex-col gap-2'>
      <StatCard
        label='Market Cap'
        tooltip='The total market value of a cryptocurrency circulating supply. It is analogous to the free-float capitalization in the stock market.'
        value={coin.market_data.market_cap.usd}
        format='currency'
        change={coin.market_data.price_change_percentage_24h}
      />
      <div className='flex gap-2 w-full'>
        <div className='flex-1'>
          <StatCard
            label='Volume (24h)'
            tooltip='A measure of how much of a cryptocurrency was traded in the last 24 hours.'
            value={coin.market_data.total_volume.usd}
            format='currency'
          />
        </div>
        <div className='flex-1'>
          <StatCard
            label='Vol/MCap (24h)'
            tooltip='Indicator of liquidity. The higher the ratio, the more liquid the cryptocurrency is, which should make it easier for it to be bought/sold on an exchange close to its value.
Cryptocurrencies with a low ratio are less liquid and most likely present less stable markets.'
            value={
              (coin.market_data.total_volume.usd /
                coin.market_data.market_cap.usd) *
              100
            }
            format='percent'
          />
        </div>
      </div>
    </div>
  )
}
