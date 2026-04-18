import { Badge } from '@/shared/ui/badge'
import type { Coin } from '../../types/coin'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

function formatCurrency(v?: number | null) {
  if (v == null) return '--'
  if (v < 1) {
    return `$${v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`
  }
  return `$${v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(v?: number | null) {
  if (v == null) return '--'
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`
}

function formatDate(date?: string) {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function PriceRow({
  label,
  date,
  price,
  change,
  isLoading,
}: {
  label: string
  date?: string
  price?: number
  change?: number
  isLoading?: boolean
}) {
  return (
    <div className='flex justify-between items-center'>
      <div>
        <div className='text-sm text-muted-foreground font-bold'>{label}</div>
        <div className='text-sm text-ring'>
          {isLoading ? (
            <Skeleton className='h-4 w-20 mt-1' />
          ) : (
            formatDate(date)
          )}
        </div>
      </div>
      <div className='text-right'>
        <div className='text-sm font-bold'>
          {isLoading ? (
            <Skeleton className='h-4 w-20 ml-auto' />
          ) : (
            formatCurrency(price)
          )}
        </div>
        {!isLoading && (
          <div
            className={cn(
              'text-xs font-semibold',
              change != null &&
                (change > 0 ? 'text-emerald-400' : 'text-red-500'),
            )}
          >
            {formatPercent(change)}
          </div>
        )}
      </div>
    </div>
  )
}

function PriceRangeBar({
  low,
  high,
  current,
  isLoading,
}: {
  low: number
  high: number
  current: number
  isLoading?: boolean
}) {
  if (isLoading) {
    return <Skeleton className='h-2 w-full rounded-full mt-2' />
  }

  const percentage = high === low ? 0 : ((current - low) / (high - low)) * 100

  return (
    <div>
      <div className='relative h-2 w-full bg-ring/70 rounded-full mt-2'>
        <div
          className='absolute h-2 bg-foreground rounded-full'
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
        <div
          className='absolute left-0 top-0 h-2 border border-border'
          style={{
            left: `${Math.min(Math.max(percentage, 0), 100)}%`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  )
}

export function CoinPricePerformance({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  if (!coin) {
    return (
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <div className='font-bold text-md'>Price Performance</div>
          <Badge variant='secondary' className='rounded-md font-bold'>
            24h
          </Badge>
        </div>
        <div className='py-1'>
          <div className='flex justify-between mb-2'>
            <div>
              <div className='text-sm text-muted-foreground font-bold'>Low</div>
              <Skeleton className='h-3 w-16 mt-1' />
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground font-bold'>
                High
              </div>
              <Skeleton className='h-3 w-16 mt-1 ml-auto' />
            </div>
          </div>
          <Skeleton className='h-3 w-full rounded-full mt-2' />
        </div>
        <div className='flex flex-col gap-3 pt-3'>
          <PriceRow label='All-time high' isLoading />
          <PriceRow label='All-time low' isLoading />
        </div>
      </div>
    )
  }

  const data = coin.market_data

  return (
    <div>
      <div className='flex items-center gap-2'>
        <div className='font-bold text-md'>Price Performance</div>
        <Badge variant='secondary' className='rounded-md font-bold'>
          24h
        </Badge>
      </div>
      <div className='py-1'>
        <div className='flex justify-between'>
          <div>
            <div className='text-sm text-muted-foreground font-bold'>Low</div>
            <div className='font-bold text-sm'>
              {isLoading ? (
                <Skeleton className='h-4 w-16 mt-1' />
              ) : (
                formatCurrency(data.low_24h?.usd)
              )}
            </div>
          </div>
          <div className='text-right'>
            <div className='text-sm text-muted-foreground font-bold'>High</div>
            <div className='font-bold text-sm'>
              {isLoading ? (
                <Skeleton className='h-4 w-16 mt-1 ml-auto' />
              ) : (
                formatCurrency(data.high_24h?.usd)
              )}
            </div>
          </div>
        </div>
        <PriceRangeBar
          low={data.low_24h.usd}
          high={data.high_24h.usd}
          current={data.current_price.usd}
          isLoading={isLoading}
        />
      </div>
      <div className='flex flex-col gap-3 pt-3'>
        <PriceRow
          label='All-time high'
          date={data.ath_date?.usd}
          price={data.ath?.usd}
          change={data.ath_change_percentage?.usd}
          isLoading={isLoading}
        />
        <PriceRow
          label='All-time low'
          date={data.atl_date?.usd}
          price={data.atl?.usd}
          change={data.atl_change_percentage?.usd}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
