import { Link } from '@tanstack/react-router'
import { Minus, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import { useCurrency } from '@/features/currency/hooks'
import type { CoinsList } from '@/features/market/types/coins-list'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  formatPercent,
  getChange,
  getTileColors,
  splitTreemap,
} from '../utils/heatmap-utils'
import type {
  HeatmapNode,
  HeatmapPeriod,
  HeatmapSizeMetric,
} from '../types/heatmap-types'
import { useElementSize } from '../hooks/use-element-size'

type HeatmapRendererProps = {
  coins: CoinsList[]
  period: HeatmapPeriod
  sizeMetric: HeatmapSizeMetric
  format: ReturnType<typeof useCurrency>['format']
  isLoading: boolean
  isError: boolean
}

type SkeletonTileProps = {
  className?: string
  style: CSSProperties
  size?: 'huge' | 'large' | 'medium' | 'small' | 'tiny'
  lines?: number
}

function SkeletonTile({
  className,
  style,
  size = 'medium',
  lines = 2,
}: SkeletonTileProps) {
  const iconSize = {
    huge: 'size-14 md:size-12',
    large: 'size-9 md:size-10',
    medium: 'size-7',
    small: 'size-5',
    tiny: 'size-3',
  }[size]

  const lineWidth = {
    huge: 'w-28',
    large: 'w-22',
    medium: 'w-14',
    small: 'w-9',
    tiny: 'w-4',
  }[size]

  return (
    <Skeleton
      style={style}
      className={cn(
        'absolute flex items-center justify-center overflow-hidden rounded-none',
        className,
      )}
    >
      <div className='flex flex-col items-center gap-2'>
        <Skeleton className={cn('rounded-full', iconSize)} />
        {lines > 0 && (
          <div className='flex flex-col items-center gap-1'>
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  'h-2 rounded-none',
                  index === 0 ? lineWidth : 'w-10',
                  size === 'huge' && index === 0 && 'h-3',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </Skeleton>
  )
}

function SkeletonMiniGrid({
  className,
  columns,
  rows,
  style,
}: {
  className?: string
  columns: number
  rows: number
  style: CSSProperties
}) {
  return (
    <div
      style={style}
      className={cn('absolute grid gap-0.5 overflow-hidden', className)}
      data-slot='heatmap-mini-grid'
    >
      {Array.from({ length: columns * rows }).map((_, index) => (
        <Skeleton key={index} className='min-h-0 min-w-0 rounded-none' />
      ))}
    </div>
  )
}

// ... HeatmapSkeleton, HeatmapTile, HeatmapRenderer без изменений

function HeatmapSkeleton() {
  return (
    <div className='absolute inset-0 animate-pulse bg-neutral-950'>
      <div className='relative h-full w-full md:hidden'>
        <SkeletonTile
          size='huge'
          style={{ left: '0.5%', top: '0.5%', width: '55.5%', height: '99%' }}
        />
        <SkeletonTile
          size='medium'
          style={{ left: '56.5%', top: '0.5%', width: '21.5%', height: '39%' }}
        />
        <SkeletonTile
          size='medium'
          style={{ left: '78.5%', top: '0.5%', width: '21%', height: '39%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '56.5%', top: '40%', width: '21.5%', height: '16%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '78.5%', top: '40%', width: '21%', height: '16%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '56.5%', top: '56.5%', width: '14%', height: '22%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '56.5%', top: '79%', width: '14%', height: '20.5%' }}
        />
        <SkeletonMiniGrid
          columns={10}
          rows={14}
          style={{
            left: '71%',
            top: '56.5%',
            width: '28.5%',
            height: '43%',
            gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(14, minmax(0, 1fr))',
          }}
        />
      </div>

      <div className='relative hidden h-full w-full md:block'>
        <SkeletonTile
          size='huge'
          style={{
            left: '0.35%',
            top: '0.6%',
            width: '55.8%',
            height: '98.8%',
          }}
        />
        <SkeletonTile
          size='large'
          style={{
            left: '56.45%',
            top: '0.6%',
            width: '23.1%',
            height: '40.5%',
          }}
        />
        <SkeletonTile
          size='large'
          style={{
            left: '79.85%',
            top: '0.6%',
            width: '19.8%',
            height: '40.5%',
          }}
        />
        <SkeletonTile
          size='medium'
          style={{
            left: '56.45%',
            top: '41.5%',
            width: '11.25%',
            height: '29.5%',
          }}
        />
        <SkeletonTile
          size='medium'
          style={{
            left: '56.45%',
            top: '71.4%',
            width: '11.25%',
            height: '28%',
          }}
        />
        <SkeletonTile
          size='medium'
          style={{ left: '68.05%', top: '41.5%', width: '8.8%', height: '35%' }}
        />
        <SkeletonTile
          size='small'
          style={{
            left: '68.05%',
            top: '76.9%',
            width: '8.8%',
            height: '22.5%',
          }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '77.2%', top: '41.5%', width: '10.6%', height: '13%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '88.15%', top: '41.5%', width: '5.4%', height: '13%' }}
        />
        <SkeletonTile
          size='small'
          style={{ left: '93.9%', top: '41.5%', width: '5.75%', height: '13%' }}
        />
        <SkeletonMiniGrid
          columns={18}
          rows={14}
          style={{
            left: '77.2%',
            top: '54.9%',
            width: '22.45%',
            height: '44.5%',
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(14, minmax(0, 1fr))',
          }}
        />
      </div>
    </div>
  )
}

function HeatmapTile({
  node,
  period,
  sizeMetric,
  format,
}: {
  node: HeatmapNode
  period: HeatmapPeriod
  sizeMetric: HeatmapSizeMetric
  format: ReturnType<typeof useCurrency>['format']
}) {
  const { coin, rect } = node
  const change = getChange(coin, period)
  const colors = getTileColors(change)
  const metricValue = coin[sizeMetric]
  const changeLabel =
    change == null || !Number.isFinite(change)
      ? '--'
      : `${Math.abs(change).toFixed(2)}%`
  const elongated = rect.width > rect.height * 1.45
  const compact = rect.width < 104 || rect.height < 66 || elongated
  const tiny = rect.width < 54 || rect.height < 46
  const iconOnly = rect.width < 38 || rect.height < 34
  const large = rect.width > 190 && rect.height > 120
  const huge = rect.width > 320 && rect.height > 170
  const label = compact ? coin.symbol.toUpperCase() : coin.name
  const micro = rect.width < 18 || rect.height < 18
  const gap = micro ? 1 : 2

  return (
    <Link
      to='/coins/$coinId'
      params={{ coinId: coin.id }}
      title={`${coin.name} ${formatPercent(change)}`}
      style={{
        left: rect.x + gap,
        top: rect.y + gap,
        width: Math.max(rect.width - gap * 2, 0),
        height: Math.max(rect.height - gap * 2, 0),
        background: colors.background,
        color: colors.color,
        boxShadow: colors.glow,
      }}
      className={cn(
        'group absolute flex overflow-hidden hover:z-10 hover:outline-3 hover:outline-sky-500 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-sky-400',
        tiny ? 'p-0.5' : 'p-1.5',
      )}
    >
      <div className='relative z-10 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center text-center'>
        {(iconOnly || !tiny) && (
          <img
            src={coin.image}
            alt=''
            loading='lazy'
            className={cn(
              'rounded-full',
              huge
                ? 'mb-1 size-16'
                : large
                  ? 'mb-1 size-12'
                  : iconOnly
                    ? 'size-4'
                    : compact
                      ? 'mb-0.5 size-5'
                      : 'mb-1 size-7',
            )}
          />
        )}

        {!iconOnly && (
          <div
            className={cn(
              'max-w-full truncate px-0.5 font-semibold leading-none tracking-tight drop-shadow-sm',
              huge
                ? 'text-4xl'
                : large
                  ? 'text-2xl'
                  : compact
                    ? 'text-[10px]'
                    : 'text-sm',
            )}
          >
            {label}
          </div>
        )}

        {!tiny && !iconOnly && (
          <div
            className={cn(
              'mt-1 flex items-center gap-0.5 font-medium leading-none',
              huge
                ? 'text-3xl'
                : large
                  ? 'text-xl'
                  : compact
                    ? 'text-[10px]'
                    : 'text-xs',
            )}
          >
            {(change ?? 0) >= 0 ? (
              <Plus
                className={cn(huge ? 'size-8' : large ? 'size-5' : 'size-3')}
              />
            ) : (
              <Minus
                className={cn(huge ? 'size-8' : large ? 'size-5' : 'size-3')}
              />
            )}
            {changeLabel}
          </div>
        )}

        {!compact && rect.height > 86 && (
          <div
            className={cn(
              'mt-1 max-w-full truncate font-medium opacity-85',
              huge ? 'text-sm' : 'text-xs',
            )}
          >
            {format(metricValue, { notation: 'compact' })}
          </div>
        )}
      </div>
    </Link>
  )
}

export function HeatmapRenderer({
  coins,
  period,
  sizeMetric,
  format,
  isLoading,
  isError,
}: HeatmapRendererProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()

  const nodes = useMemo(() => {
    if (!size.width || !size.height) return []

    const items = coins
      .map((coin) => ({
        coin,
        value: Math.max(coin[sizeMetric] ?? 0, 0),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    return splitTreemap(items, {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    })
  }, [coins, size.height, size.width, sizeMetric])

  return (
    <div
      ref={ref}
      className='relative h-full min-h-0 overflow-hidden bg-neutral-950'
    >
      {isLoading || !size.width || !size.height ? (
        <HeatmapSkeleton />
      ) : isError ? (
        <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
          Could not load market data. Try again in a moment.
        </div>
      ) : (
        nodes.map((node) => (
          <HeatmapTile
            key={node.coin.id}
            node={node}
            period={period}
            sizeMetric={sizeMetric}
            format={format}
          />
        ))
      )}
    </div>
  )
}
