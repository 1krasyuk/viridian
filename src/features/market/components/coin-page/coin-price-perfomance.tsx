import type { Coin } from '../../types/coin'

type Props = {
  coin: Coin
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '--'
  return `$${value.toLocaleString('en-US')}`
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return '--'
  return `${value.toFixed(2)}%`
}

function formatDate(date?: string) {
  if (!date) return '--'
  return new Date(date).toLocaleDateString()
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
        {change != null && <div>{formatPercent(change)}</div>}
      </div>
    </div>
  )
}

export function CoinPricePerformance({ coin }: Props) {
  const data = coin.market_data

  return (
    <div className='mt-4 flex flex-col gap-3'>
      <div className='font-bold'>Price Performance (24h)</div>

      <div className='flex justify-between'>
        <div>
          <div>Low</div>
          <div>{formatCurrency(data.low_24h?.usd)}</div>
        </div>

        <div>
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
