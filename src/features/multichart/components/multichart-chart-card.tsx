import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { useCoinChart } from '@/features/market/hooks/coins-queries'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { ChartItem } from '../types/types'

function Change({ value }: { value: number | null }) {
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

export function MultichartChartCard({
  item,
  height,
  onChange,
  onRemove,
}: {
  item: ChartItem
  height: number
  onChange: (patch: Partial<Pick<ChartItem, 'days' | 'dataType'>>) => void
  onRemove: () => void
}) {
  const { currency, format } = useCurrency()
  const { data: chart, isLoading } = useCoinChart(
    item.coin.id,
    item.days,
    currency,
  )
  const periodChange =
    item.days === '1'
      ? item.coin.price_change_percentage_24h
      : item.days === '7'
        ? item.coin.price_change_percentage_7d_in_currency
        : item.days === '30'
          ? item.coin.price_change_percentage_30d_in_currency
          : item.days === '365'
            ? item.coin.price_change_percentage_1y_in_currency
            : item.coin.price_change_percentage_24h

  return (
    <article
      className='min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm'
      style={{ height }}
    >
      <header className='flex h-14 items-center gap-2 border-b bg-card px-3'>
        <img src={item.coin.image} alt='' className='size-8 rounded-full' />
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-1.5'>
            <Link
              to='/coins/$coinId'
              params={{ coinId: item.coin.id }}
              className='truncate text-sm font-semibold transition-colors hover:text-primary hover:underline-offset-4'
            >
              {item.coin.name}
            </Link>
            <Badge variant='secondary' className='uppercase'>
              {item.coin.symbol}
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-xs'>
            <span className='font-medium tabular-nums'>
              {format(item.coin.current_price, { maximumFractionDigits: 6 })}
            </span>
            <Change value={periodChange} />
          </div>
        </div>
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={onRemove}
          aria-label={`Remove ${item.coin.name}`}
        >
          <X />
        </Button>
      </header>
      <div className='h-[calc(100%-3.5rem)] min-h-0 bg-muted/20'>
        <CoinChart
          coinId={item.coin.id}
          symbol={item.coin.symbol}
          chart={chart}
          days={item.days}
          onDaysChange={(days) => onChange({ days })}
          dataType={item.dataType}
          onDataTypeChange={(dataType) => onChange({ dataType })}
          isLoading={isLoading}
          view='classic'
        />
      </div>
    </article>
  )
}
