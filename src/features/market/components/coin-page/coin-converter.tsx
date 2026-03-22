import { useState, useCallback } from 'react'
import type { Coin } from '../../types/coin'
import { Input } from '@/shared/ui/input'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function CoinConverter({ coin }: { coin: Coin }) {
  const price = coin.market_data.current_price.usd

  const [coinInput, setCoinInput] = useState('1')
  const [usdInput, setUsdInput] = useState(price.toString())

  const parse = (val: string) => {
    const num = Number(val)
    return isNaN(num) ? null : num
  }

  const handleCoinChange = useCallback(
    (value: string) => {
      setCoinInput(value)

      const parsed = parse(value)
      if (parsed === null || !price) return

      setUsdInput((parsed * price).toString())
    },
    [price],
  )

  const handleUsdChange = useCallback(
    (value: string) => {
      setUsdInput(value)

      const parsed = parse(value)
      if (parsed === null || !price) return

      setCoinInput((parsed / price).toString())
    },
    [price],
  )

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }

  if (!price) {
    return <p className='text-sm text-muted-foreground'>Price unavailable</p>
  }

  const handleReset = () => {
    setCoinInput('1')
    setUsdInput((1 * price).toString())
  }

  return (
    <div>
      <div className='flex items-center justify-between pb-3'>
        <p className='font-bold text-sm'>
          {coin.symbol.toUpperCase()} to USD converter
        </p>

        <Button
          onClick={handleReset}
          variant='ghost'
          className='rounded-full w-6 h-6'
        >
          <RotateCcw />
        </Button>
      </div>

      <div className='rounded-lg border-2 border-muted-foreground overflow-hidden'>
        <div className='flex items-center border-b border-ring'>
          <span className='px-3 text-sm font-bold text-muted-foreground'>
            {coin.symbol.toUpperCase()}
          </span>
          <Input
            type='text'
            inputMode='decimal'
            value={coinInput}
            onChange={(e) => handleCoinChange(e.target.value)}
            onFocus={handleSelectAll}
            onClick={handleSelectAll}
            className='border-0 ring-0 focus-visible:ring-0 bg-transparent text-right font-semibold'
          />
        </div>

        <div className='flex items-center'>
          <span className='px-3 text-sm font-bold text-muted-foreground'>
            USD
          </span>
          <Input
            type='text'
            inputMode='decimal'
            value={usdInput}
            onChange={(e) => handleUsdChange(e.target.value)}
            onFocus={handleSelectAll}
            onClick={handleSelectAll}
            className='border-0 ring-0 focus-visible:ring-0 bg-transparent text-right font-semibold'
          />
        </div>
      </div>
    </div>
  )
}
