// features/market/components/coin-page/coin-events.tsx
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Coin } from '../../types/coin'

type EventType =
  | 'halving'
  | 'unlock'
  | 'listing'
  | 'upgrade'
  | 'partnership'
  | 'other'

type CoinEvent = {
  date: string
  title: string
  type: EventType
  impact: 'high' | 'medium' | 'low'
  description?: string
}

// Hardcoded events based on known crypto events or empty for manual input
// In real app, this would come from API (CoinGecko events, CoinMarketCal, etc.)
function generateEvents(coin: Coin | undefined): CoinEvent[] {
  if (!coin) return []

  const events: CoinEvent[] = []
  const symbol = coin?.symbol?.toUpperCase()

  // Bitcoin halving approximation (every 210k blocks, ~4 years)
  if (symbol === 'BTC') {
    events.push({
      date: '2028-04-14',
      title: 'Next Halving',
      type: 'halving',
      impact: 'high',
      description: 'Block reward drops from 3.125 to 1.5625 BTC',
    })
  }

  // Ethereum
  if (symbol === 'ETH') {
    events.push({
      date: '2025-05-07',
      title: 'Pectra Upgrade',
      type: 'upgrade',
      impact: 'medium',
      description: 'Account abstraction and validator improvements',
    })
  }

  // Generic: if no specific events, show empty state
  return events
}

function EventIcon({ type }: { type: EventType }) {
  switch (type) {
    case 'halving':
      return <TrendingUp className='h-3.5 w-3.5 text-orange-500' />
    case 'unlock':
      return <AlertTriangle className='h-3.5 w-3.5 text-red-500' />
    case 'listing':
      return <Sparkles className='h-3.5 w-3.5 text-blue-500' />
    case 'upgrade':
      return <Zap className='h-3.5 w-3.5 text-purple-500' />
    default:
      return <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
  }
}

function ImpactBadge({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-amber-500/10 text-amber-500',
    low: 'bg-emerald-500/10 text-emerald-500',
  }

  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[impact]}`}
    >
      {impact}
    </span>
  )
}

function formatEventDate(dateStr: string): { label: string; days: number } {
  const event = new Date(dateStr)
  const now = new Date()
  const diffMs = event.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (days < 0) return { label: `${Math.abs(days)}d ago`, days }
  if (days === 0) return { label: 'Today', days }
  if (days === 1) return { label: 'Tomorrow', days }
  if (days < 30) return { label: `${days}d left`, days }
  if (days < 365) return { label: `${Math.floor(days / 30)}mo left`, days }
  return { label: `${Math.floor(days / 365)}y left`, days }
}

export function CoinEvents({
  coin,
  isLoading,
}: {
  coin: Coin | undefined
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className='rounded-lg border bg-card p-4 space-y-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-20 w-full' />
      </div>
    )
  }

  const events = generateEvents(coin)

  if (events.length === 0) {
    return (
      <div className='rounded-lg border  p-4 space-y-3'>
        <h3 className='text-sm font-bold uppercase tracking-wide flex text-muted-foreground items-center gap-2'>
          <Calendar className='h-4 w-4' />
          Upcoming Events
        </h3>

        <p className='text-sm text-muted-foreground text-center py-4'>
          No upcoming events for {coin?.name || 'this asset'}
        </p>
      </div>
    )
  }

  return (
    <div className='rounded-lg border  p-4 space-y-3'>
      <h3 className='text-md font-semibold uppercase flex items-center gap-2'>
        <Calendar className='h-4 w-4' />
        Upcoming Events
      </h3>

      <div className='space-y-2 bg-card rounded-xl'>
        {events.map((event, i) => {
          const { label, days } = formatEventDate(event.date)
          const isPast = days < 0

          return (
            <div
              key={i}
              className={`flex  items-start gap-2.5 p-2.5 rounded-md ${isPast ? 'bg-muted/20 opacity-60' : 'bg-sidebar'}`}
            >
              <div className='mt-0.5'>
                <EventIcon type={event.type} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='text-sm font-semibold truncate'>
                    {event.title}
                  </span>
                  <ImpactBadge impact={event.impact} />
                </div>
                {event.description && (
                  <p className='text-sm text-muted-foreground mt-0.5'>
                    {event.description}
                  </p>
                )}
                <div className='flex items-center gap-1.5 mt-1'>
                  <Clock className='h-3 w-3 text-muted-foreground' />
                  <span
                    className={`text-xs font-mono ${days < 7 && days >= 0 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}`}
                  >
                    {label}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    (
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    )
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
