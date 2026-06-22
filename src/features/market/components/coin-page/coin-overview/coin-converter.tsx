import { useState, useMemo } from 'react'
import type { Coin } from '../../../types/coin'
import { Input } from '@/shared/ui/input'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useCurrency } from '@/features/currency/hooks'

export function CoinConverter({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  const { getValue, currency } = useCurrency()

  const price = getValue(coin?.market_data?.current_price)
  const symbol = coin?.symbol?.toUpperCase()

  const [coinInput, setCoinInput] = useState('1')

  // Вычисляем fiat всегда от текущего coinInput и price
  const fiatInput = useMemo(() => {
    const parsed = Number(coinInput)
    if (isNaN(parsed) || !price) return ''
    return (parsed * price).toString()
  }, [coinInput, price])

  const parse = (val: string) => {
    const num = Number(val)
    return isNaN(num) ? null : num
  }

  const handleCoinChange = (value: string) => {
    setCoinInput(value)
  }

  const handleFiatChange = (value: string) => {
    const parsed = parse(value)
    if (parsed === null || !price) return
    setCoinInput((parsed / price).toString())
  }

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }

  if (isLoading || !coin) {
    return (
      <div>
        <div className='flex items-center justify-between pb-3'>
          <div className='flex items-center gap-1'>
            <Skeleton className='h-5 w-10' />
            <span className='text-sm font-bold text-muted-foreground'>to</span>
            <Skeleton className='h-5 w-8' />
            <span className='text-sm font-bold text-muted-foreground'>
              converter
            </span>
          </div>
          <Button variant='ghost' className='rounded-full w-6 h-6' disabled>
            <RotateCcw className='opacity-50' />
          </Button>
        </div>

        <div className='rounded-lg border-2 border-muted-foreground overflow-hidden'>
          <div className='flex items-center border-b border-ring p-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-5 flex-1 ml-2' />
          </div>

          <div className='flex items-center p-2'>
            <Skeleton className='h-4 w-8' />
            <Skeleton className='h-5 flex-1 ml-2' />
          </div>
        </div>
      </div>
    )
  }

  if (!price) {
    return <p className='text-sm text-muted-foreground'>Price unavailable</p>
  }

  const handleReset = () => {
    setCoinInput('1')
  }

  return (
    <div>
      <div className='flex items-center justify-between pb-3'>
        <p className='font-bold text-sm'>
          {symbol} to {currency.toUpperCase()} converter
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
            {symbol}
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
            {currency.toUpperCase()}
          </span>
          <Input
            type='text'
            inputMode='decimal'
            value={fiatInput}
            onChange={(e) => handleFiatChange(e.target.value)}
            onFocus={handleSelectAll}
            onClick={handleSelectAll}
            className='border-0 ring-0 focus-visible:ring-0 bg-transparent text-right font-semibold'
          />
        </div>
      </div>
    </div>
  )
}
