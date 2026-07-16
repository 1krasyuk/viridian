import type { ReactNode } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

type CoinMetricCardProps = {
  icon: ReactNode
  label: string
  value: string
  subvalue?: string
  accent?: boolean
  warning?: boolean
  isLoading?: boolean
  valueClassName?: string
}

export function CoinMetricCard({
  icon,
  label,
  value,
  subvalue,
  accent = false,
  warning = false,
  isLoading = false,
  valueClassName = '',
}: CoinMetricCardProps) {
  const variants = {
    default:
      'bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30',
    accent:
      'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/12 hover:to-emerald-500/7',
    warning:
      'bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:from-orange-500/12 hover:to-orange-500/7',
  }

  const variant = warning ? 'warning' : accent ? 'accent' : 'default'
  const textColor = warning
    ? 'text-orange-500'
    : accent
      ? 'text-emerald-500'
      : ''

  return (
    <div
      className={`rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-200 ${variants[variant]}`}
    >
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider'>
        {icon}
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className='h-6 w-28' />
      ) : (
        <p
          className={`text-lg font-bold font-mono tracking-tight break-all ${textColor} ${valueClassName}`}
        >
          {value}
        </p>
      )}
      {subvalue && (
        <p className='text-xs text-muted-foreground font-mono break-all'>
          {isLoading ? (
            <Skeleton className='h-3 w-20 inline-block' />
          ) : (
            subvalue
          )}
        </p>
      )}
    </div>
  )
}
