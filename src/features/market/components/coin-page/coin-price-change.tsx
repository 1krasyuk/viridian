import type { Coin } from '../../types/coin'

export function CoinPriceChange({ coin }: { coin: Coin }) {
  const periods = [
    {
      key: '1h',
      label: '1h',
      value: coin.market_data.price_change_percentage_1h_in_currency?.usd,
    },
    {
      key: '24h',
      label: '24h',
      value: coin.market_data.price_change_percentage_24h_in_currency?.usd,
    },
    {
      key: '7d',
      label: '7d',
      value: coin.market_data.price_change_percentage_7d_in_currency?.usd,
    },
    {
      key: '14d',
      label: '14d',
      value: coin.market_data.price_change_percentage_14d_in_currency?.usd,
    },
    {
      key: '30d',
      label: '30d',
      value: coin.market_data.price_change_percentage_30d_in_currency?.usd,
    },
    {
      key: '1y',
      label: '1y',
      value: coin.market_data.price_change_percentage_1y_in_currency?.usd,
    },
  ] as const

  return (
    <div className='grid grid-cols-6 gap-px bg-border rounded-lg overflow-hidden border-2'>
      {periods.map(({ key, label, value }) => (
        <div key={key} className='flex flex-col'>
          <div className='flex items-center justify-center py-2 px-2 bg-card border-b border-border'>
            <span className='text-xs  font-black text-muted-foreground'>
              {label}
            </span>
          </div>

          <div className='flex items-center justify-center py-3 px-2 bg-background'>
            {value !== null && value !== undefined ? (
              <span
                className={`text-sm font-semibold ${
                  value > 0
                    ? 'text-emerald-500'
                    : value < 0
                      ? 'text-red-500'
                      : 'text-foreground'
                }`}
                title={value.toFixed(4)}
              >
                <span className='inline-block scale-x-130 scale-y-60 mr-1 text-xs'>
                  {value >= 0 ? '▲' : '▼'}
                </span>
                {Math.abs(value).toFixed(1)}%
              </span>
            ) : (
              <span className='text-sm text-muted-foreground'>—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
