import type { ReactNode } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

type CoinMetricCardProps = {
  icon: ReactNode
  label: string
  value: ReactNode
  subvalue?: ReactNode
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
      className={`flex h-full flex-col gap-1.5 rounded-xl p-3 transition-all duration-200 ${variants[variant]}`}
    >
      <div className='flex min-h-8 items-start gap-1.5 text-xs font-medium leading-4 text-muted-foreground uppercase tracking-wider'>
        {icon}
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className='h-6 w-28' />
      ) : (
        <p
          className={`wrap-break-word font-mono text-lg font-bold tracking-tight ${textColor} ${valueClassName}`}
        >
          {value}
        </p>
      )}
      {subvalue && (
        <p className='mt-auto wrap-break-word font-mono text-xs text-muted-foreground'>
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
