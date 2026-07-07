import {
  Activity,
  CircleDollarSign,
  Globe,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type HeatmapSummaryBarProps = {
  averageChange: string
  averageTone: 'positive' | 'negative'
  advancers: number
  decliners: number
  totalCoins: number
  totalCap: string
  modeLabel: string
}

function SummaryItem({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: 'positive' | 'negative'
}) {
  return (
    <div className='flex min-w-0 items-center gap-1 whitespace-nowrap'>
      <span
        className={cn(
          'text-muted-foreground',
          tone === 'positive' && 'text-emerald-500',
          tone === 'negative' && 'text-rose-500',
        )}
      >
        {icon}
      </span>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-semibold text-foreground'>{value}</span>
    </div>
  )
}

export function HeatmapSummaryBar({
  averageChange,
  averageTone,
  advancers,
  decliners,
  totalCoins,
  totalCap,
  modeLabel,
}: HeatmapSummaryBarProps) {
  return (
    <footer className='flex shrink-0 flex-col gap-1 border-t bg-background/95 px-2.5 py-1.5 text-xs backdrop-blur md:min-h-9 md:flex-row md:items-center md:gap-4'>
      <div className='min-w-0 truncate font-semibold text-foreground'>
        {modeLabel}
      </div>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-4 md:flex-nowrap'>
        <SummaryItem
          label='Total MCap'
          value={totalCap}
          icon={<Globe className='size-3.5' />}
        />
        <div className='hidden sm:block'>
          <SummaryItem
            label='Coins'
            value={totalCoins}
            icon={<CircleDollarSign className='size-3.5' />}
          />
        </div>
        <SummaryItem
          label='Avg'
          value={averageChange}
          icon={<Activity className='size-3.5' />}
          tone={averageTone}
        />
        <SummaryItem
          label='Up'
          value={advancers}
          icon={<TrendingUp className='size-3.5' />}
          tone='positive'
        />
        <SummaryItem
          label='Down'
          value={decliners}
          icon={<TrendingDown className='size-3.5' />}
          tone='negative'
        />
      </div>
    </footer>
  )
}
