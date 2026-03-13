import { useTheme } from '@/shared/lib/theme-provider'

export function CoinChart({ symbol }: { symbol: string | undefined }) {
  const { theme } = useTheme()

  return (
    <>
      <iframe
        className='w-9/12 h-screen'
        src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=${theme}&style=3&hide_side_toolbar=false&autosize=true`}
      ></iframe>
    </>
  )
}
