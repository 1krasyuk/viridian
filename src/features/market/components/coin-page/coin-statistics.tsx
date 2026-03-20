import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/tooltip'
import type { Coin } from '../../types/coin'
import { Info } from 'lucide-react'

type Format = 'currency' | 'number' | 'percent' | 'suffix'

type StatCardProps = {
  label: string
  tooltip?: string
  value: number | null
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
  format,
  change,
  suffix,
}: StatCardProps) {
  const formattedValue = formatValue(value ?? 0, format, suffix)

  return (
    <div className='flex flex-col items-center justify-between gap-1 p-2 border border-muted-foreground rounded-md w-full h-full text-center'>
      <TooltipProvider>
        <div className='flex items-center justify-center gap-1 text-muted-foreground text-sm w-full wrap-break-word'>
          <span>{label}</span>
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='inline-flex items-center gap-1'>
                  <Info size='14' className='shrink-0' />
                </span>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <span className='whitespace-pre-line'>{tooltip}</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span>{label}</span>
          )}
        </div>
      </TooltipProvider>

      <div className='flex items-center justify-center flex-wrap gap-2 w-full'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='font-bold text-sm cursor-default truncate'>
                {formattedValue}
              </span>
            </TooltipTrigger>
            <TooltipContent className='text-xs' side='bottom'>
              <span className='whitespace-pre-line'>
                {formatTooltipValue(value, format, suffix)}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {change != null && <ChangeBadge value={change} />}
      </div>
    </div>
  )
}

export function CoinStatistics({ coin }: { coin: Coin }) {
  return (
    <div className='my-3 grid grid-cols-6 gap-2 items-stretch'>
      <div className='col-span-6'>
        <StatCard
          label='Market Cap'
          tooltip='The total market value of a cryptocurrency circulating supply. It is analogous to the free-float capitalization in the stock market.'
          value={coin.market_data.market_cap.usd}
          format='currency'
          change={coin.market_data.price_change_percentage_24h}
        />
      </div>

      <div className='col-span-3'>
        <StatCard
          label='Volume (24h)'
          tooltip='A measure of how much of a cryptocurrency was traded in the last 24 hours.'
          value={coin.market_data.total_volume.usd}
          format='currency'
        />
      </div>
      <div className='col-span-3'>
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

      <div className='col-span-6'>
        <StatCard
          label='FDV'
          tooltip='Fully-diluted value (FDV) = price x max supply. If max supply is null, FDV = price x total supply. If max supply and total supply are infinite or not available, fully-diluted value shows - -.

          FDV is the same when max supply = total supply or when max supply is infinite.'
          value={coin.market_data.fully_diluted_valuation.usd}
          format='currency'
        />
      </div>

      <div className='col-span-2'>
        <StatCard
          label='Total supply'
          tooltip='Total supply = Total coins created - coins that have been burned (if any) It is comparable to outstanding shares in the stock market.

            If the project did not submit this data nor was it verified by CoinMarketCap, total supply shows “--”.'
          value={coin.market_data.total_supply}
          format='suffix'
          suffix='BTC'
        />
      </div>
      <div className='col-span-2'>
        <StatCard
          label='Max. supply'
          tooltip='The best approximation of the maximum amount of coins that will exist in the forthcoming lifespan of the cryptocurrency, minus any coins that have been verifiably burned. This is also known as the theoretical max number of coins that can be minted, minus any coins that have been verifiably burned.

            If the project did not submit this data nor was it verified by CoinMarketCap, max. supply shows "--".'
          value={coin.market_data.max_supply}
          format='suffix'
          suffix='BTC'
        />
      </div>
      <div className='col-span-2'>
        <StatCard
          label='Circ. supply'
          tooltip='The best approximation of the maximum amount of coins that will exist in the forthcoming lifespan of the cryptocurrency, minus any coins that have been verifiably burned. This is also known as the theoretical max number of coins that can be minted, minus any coins that have been verifiably burned.

            If the project did not submit this data nor was it verified by CoinMarketCap, max. supply shows "--".'
          value={coin.market_data.circulating_supply}
          format='suffix'
          suffix='BTC'
        />
      </div>
    </div>
  )
}
