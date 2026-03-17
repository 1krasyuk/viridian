import type { Coin } from '../../types/coin'

type Props = {
  coin: Coin
}

export function CoinStatistics({ coin }: Props) {
  const priceChange = coin.market_data.price_change_percentage_24h

  return (
    <div className='my-3 flex flex-col gap-2'>
      <div className='flex flex-col items-center gap-1 p-1 border border-muted-foreground border-1.5 rounded-md'>
        <p className='text-muted-foreground text-sm'>Market cap</p>
        <div className='flex gap-3 items-center'>
          <p className='font-bold text-sm'>
            {coin.market_data.market_cap.usd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 2,
            })}
          </p>

          <p
            className={` inline-flex items-center font-bold text-xs ${
              priceChange == null
                ? 'text-gray-400'
                : priceChange >= 0
                  ? 'text-emerald-500'
                  : 'text-red-500'
            }`}
          >
            <span className='inline-block scale-x-150 scale-y-80 mr-1 text-xs'>
              {priceChange == null ? '—' : priceChange >= 0 ? '▲' : '▼'}
            </span>
            {priceChange != null ? priceChange.toFixed(2) : ''}%
          </p>
        </div>
      </div>
      <div className='flex w-full gap-2'>
        <div className='flex flex-col items-center gap-1 p-1 border border-muted-foreground border-1.5 rounded-md w-1/2'>
          <p className='text-muted-foreground text-sm'>Volume</p>
          <p className='font-bold text-sm'>
            {coin.market_data.total_volume.usd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className='flex flex-col items-center gap-1 p-1 border border-muted-foreground border-1.5 rounded-md w-1/2'>
          <p className='text-muted-foreground text-sm'>Vol/MCap (24h)</p>
          <p className='font-bold text-sm'>
            {(
              (coin.market_data.total_volume.usd /
                coin.market_data.market_cap.usd) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>
      </div>
    </div>
  )
}
