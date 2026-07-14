import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Clock3 } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  type RecentlyVisitedCoin,
  useRecentlyVisitedStore,
} from './recently-visited-store'

type RecentlyVisitedCoinsProps = {
  variant?: 'sidebar' | 'mobile'
  onNavigate?: () => void
}

function RecentlyVisitedCoinLink({
  coin,
  variant,
  onNavigate,
}: {
  coin: RecentlyVisitedCoin
  variant: 'sidebar' | 'mobile'
  onNavigate?: () => void
}) {
  const { format } = useCurrency()
  const priceLabel =
    coin.currentPrice == null || !Number.isFinite(coin.currentPrice)
      ? '—'
      : format(coin.currentPrice, {
          notation: 'compact',
          maximumFractionDigits: 2,
        })

  const change = coin.priceChangePercentage24h
  const changeLabel =
    change == null || !Number.isFinite(change)
      ? '—'
      : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`

  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      onClick={onNavigate}
      className={cn(
        'flex min-w-0 items-center gap-2 bg-popover/10 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground ',
        variant === 'sidebar'
          ? 'px-2 py-1 group-data-[collapsible=icon]:min-h-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'
          : 'h-22 flex-col justify-start  px-2 py-1 text-center',
      )}
    >
      <img
        src={coin.image}
        alt=''
        loading='lazy'
        className='size-6 shrink-0 rounded-full object-contain'
      />
      <div
        className={cn(
          'min-w-0',
          variant === 'sidebar'
            ? 'group-data-[collapsible=icon]:hidden'
            : 'flex flex-col items-center',
        )}
      >
        <span
          className={cn(
            'font-semibold leading-tight',
            variant === 'sidebar'
              ? 'text-sm'
              : 'line-clamp-2 min-h-8 max-w-full wrap-break-word text-xs',
          )}
        >
          {coin.name}
        </span>
        <span
          className={cn(
            'mt-0.5 flex items-center gap-1 text-muted-foreground',
            variant === 'sidebar' ? 'text-[11px]' : 'text-[10px]',
          )}
        >
          <span>{priceLabel}</span>
          <span
            className={cn(
              change != null &&
                Number.isFinite(change) &&
                (change > 0
                  ? 'text-emerald-500'
                  : change < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'),
            )}
          >
            {changeLabel}
          </span>
        </span>
      </div>
    </Link>
  )
}

export function RecentlyVisitedCoins({
  variant = 'sidebar',
  onNavigate,
}: RecentlyVisitedCoinsProps) {
  const coins = useRecentlyVisitedStore((state) => state.coins)
  const [open, setOpen] = React.useState(true)
  const visibleCoins = open ? coins : []

  if (variant === 'mobile') {
    return (
      <section className='rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-3'>
        <div className='flex items-center gap-2 text-sm font-bold text-sidebar-foreground'>
          <Clock3 className='size-5 text-sidebar-foreground/70' />
          Recently visited
        </div>
        {coins.length > 0 && (
          <div className='mt-3 grid grid-cols-4 gap-2'>
            {coins.map((coin) => (
              <RecentlyVisitedCoinLink
                key={coin.id}
                coin={coin}
                variant='mobile'
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className='mt-2 overflow-hidden rounded-md border-2 border-sidebar-border/70 group-data-[collapsible=icon]:-mx-2 group-data-[collapsible=icon]:mt-1 '>
      <Button
        type='button'
        variant='secondary'
        disabled={coins.length === 0}
        onClick={() => setOpen((value) => !value)}
        className='h-auto w-full justify-start rounded-none border-0 bg-sidebar-accent/50 px-2 py-2 text-md font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent dark:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1'
      >
        <Clock3 className='size-6 stroke-[1.5]' />
        <span className='group-data-[collapsible=icon]:hidden'>
          Recently visited
        </span>
        <ChevronDown
          className={cn(
            'ml-auto size-4 transition-transform group-data-[collapsible=icon]:ml-0',
            open && 'rotate-180',
            coins.length === 0 && 'opacity-40',
          )}
        />
      </Button>

      {visibleCoins.length > 0 && (
        <div className='grid border-t-2 border-sidebar-border/70 bg-popover/80 dark:bg-neutral-900/90'>
          {visibleCoins.map((coin) => (
            <RecentlyVisitedCoinLink
              key={coin.id}
              coin={coin}
              variant='sidebar'
            />
          ))}
        </div>
      )}
    </section>
  )
}
