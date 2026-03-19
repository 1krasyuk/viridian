import type { Coin } from '../../types/coin'

type Props = {
  coin: Coin
}

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
}: {
  label: string
  date?: string
  price?: number
  change?: number
}) {
  return (
    <div className='flex justify-between'>
      <div>
        <div>{label}</div>
        <div>{formatDate(date)}</div>
      </div>

      <div className='text-right'>
        <div>{formatCurrency(price)}</div>
        <div
          className={
            change != null
              ? change > 0
                ? 'text-emerald-400'
                : 'text-destructive'
              : ''
          }
        >
          {formatPercent(change)}
        </div>
      </div>
    </div>
  )
}

export function CoinPricePerformance({ coin }: Props) {
  const data = coin.market_data

  return (
    <div className='flex flex-col'>
      <div className='font-bold'>Price Performance (24h)</div>

      <div className='flex justify-between'>
        <div>
          <div>Low</div>
          <div>{formatCurrency(data.low_24h?.usd)}</div>
        </div>

        <div className='text-right'>
          <div>High</div>
          <div>{formatCurrency(data.high_24h?.usd)}</div>
        </div>
      </div>

      <PriceRow
        label='All-Time High'
        date={data.ath_date?.usd}
        price={data.ath?.usd}
        change={data.ath_change_percentage?.usd}
      />

      <PriceRow
        label='All-Time Low'
        date={data.atl_date?.usd}
        price={data.atl?.usd}
        change={data.atl_change_percentage?.usd}
      />
    </div>
  )
}
