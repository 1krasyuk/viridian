import { Check, Plus } from 'lucide-react'
import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

function CoinChange({ value }: { value: number | null }) {
  if (value == null) return <span className='text-muted-foreground'>—</span>
  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        value >= 0 ? 'text-emerald-500' : 'text-red-500',
      )}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

function CoinSparkline({ coin }: { coin: CoinsList }) {
  const prices = coin.sparkline_in_7d?.price?.filter(Number.isFinite) ?? []
  if (prices.length < 2) return <div className='h-9' />
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const points = prices
    .map(
      (price, index) =>
        `${(index / (prices.length - 1)) * 100},${44 - ((price - min) / range) * 40}`,
    )
    .join(' ')
  const path = `M ${points.replaceAll(' ', ' L ')}`
  const area = `${path} L 100,48 L 0,48 Z`
  const gradientId = `coin-sparkline-${coin.id}`
  const positive = prices.at(-1)! >= prices[0]
  return (
    <svg
      viewBox='0 0 100 48'
      preserveAspectRatio='none'
      className={cn(
        'h-9 w-full',
        positive ? 'text-emerald-500' : 'text-red-500',
      )}
      aria-hidden='true'
    >
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.3' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.02' />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CoinPickerCard({
  coin,
  alreadyAdded,
  selected,
  onToggle,
}: {
  coin: CoinsList
  alreadyAdded: boolean
  selected: boolean
  onToggle: () => void
}) {
  const { format } = useCurrency()
  const liquidity = coin.market_cap
    ? ((coin.total_volume ?? 0) / coin.market_cap) * 100
    : null
  return (
    <button
      type='button'
      disabled={alreadyAdded}
      onClick={onToggle}
      className={cn(
        'rounded-xl border bg-linear-to-br from-card to-background p-3 text-left transition-all hover:border-primary/45 disabled:opacity-45',
        selected && 'border-primary bg-primary/5 ring-1 ring-primary',
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          <img
            src={coin.image}
            alt=''
            className='size-8 rounded-full'
            loading='lazy'
          />
          <span className='truncate font-medium text-base'>{coin.name}</span>
          <Badge variant='secondary' className='uppercase'>
            {coin.symbol}
          </Badge>
        </div>
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary',
            selected && 'bg-primary text-primary-foreground',
            alreadyAdded && 'bg-emerald-500/15 text-emerald-500',
          )}
        >
          {selected || alreadyAdded ? (
            <Check className='size-4' />
          ) : (
            <Plus className='size-4' />
          )}
        </span>
      </div>
      <div className='mt-2.5 flex items-baseline gap-2'>
        <span className='text-lg font-bold tabular-nums'>
          {format(coin.current_price, { maximumFractionDigits: 6 })}
        </span>
        <CoinChange value={coin.price_change_percentage_7d_in_currency} />
      </div>
      <div className='my-2'>
        <CoinSparkline coin={coin} />
      </div>
      <div className='grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs '>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-muted-foreground'>Market cap</span>
          <span className='truncate text-right font-medium'>
            {format(coin.market_cap, { notation: 'compact' })}
          </span>
        </div>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-muted-foreground'>Volume 24H</span>
          <span className='truncate text-right font-medium'>
            {format(coin.total_volume, { notation: 'compact' })}
          </span>
        </div>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-muted-foreground'>Liquidity</span>
          <span className='text-right font-medium'>
            {liquidity == null ? '—' : `${liquidity.toFixed(2)}%`}
          </span>
        </div>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-muted-foreground'>Change 24H</span>
          <CoinChange value={coin.price_change_percentage_24h} />
        </div>
      </div>
    </button>
  )
}
