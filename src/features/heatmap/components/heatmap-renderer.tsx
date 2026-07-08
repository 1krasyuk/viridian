import { Link } from '@tanstack/react-router'
import { Minus, Plus } from 'lucide-react'
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

const SKELETON_MARKET_VALUES = [
  1200,
  209,
  184,
  70,
  68,
  58,
  47,
  25,
  18,
  18,
  15,
  14,
  12,
  9,
  9,
  8,
  7,
  6.5,
  6,
  5.5,
  5,
  4.7,
  4.4,
  4.1,
  3.8,
  3.5,
  3.2,
  3,
  2.8,
  2.6,
  ...Array.from({ length: 220 }, (_, index) =>
    Math.max(0.18, 2.4 * 0.965 ** index),
  ),
]

const SKELETON_ITEMS = SKELETON_MARKET_VALUES.map((value, index) => ({
  coin: { id: `skeleton-${index}` } as CoinsList,
  value,
}))

function getTileFlags(rect: HeatmapNode['rect']) {
  const elongated = rect.width > rect.height * 1.45
  const compact = rect.width < 104 || rect.height < 66 || elongated
  const tiny = rect.width < 54 || rect.height < 46
  const iconOnly = rect.width < 38 || rect.height < 34
  const large = rect.width > 190 && rect.height > 120
  const huge = rect.width > 320 && rect.height > 170

  return { compact, tiny, iconOnly, large, huge }
}

function getSkeletonContent(rect: HeatmapNode['rect']) {
  const { compact, tiny, iconOnly, large, huge } = getTileFlags(rect)
  const iconSize = huge ? 72 : large ? 56 : iconOnly ? 18 : compact ? 26 : 34
  const labelWidth = huge
    ? Math.min(rect.width * 0.3, 180)
    : large
      ? Math.min(rect.width * 0.54, 120)
      : compact
        ? Math.min(rect.width * 0.62, 42)
        : Math.min(rect.width * 0.58, 84)
  const changeWidth = huge
    ? Math.min(rect.width * 0.28, 158)
    : large
      ? Math.min(rect.width * 0.48, 102)
      : compact
        ? Math.min(rect.width * 0.58, 38)
        : Math.min(rect.width * 0.52, 68)
  const capWidth = huge
    ? Math.min(rect.width * 0.12, 58)
    : large
      ? Math.min(rect.width * 0.2, 42)
      : Math.min(rect.width * 0.24, 30)

  return {
    compact,
    tiny,
    iconOnly,
    large,
    huge,
    showCap: !compact && rect.height > 86,
    iconSize: Math.max(
      10,
      Math.min(iconSize, rect.width * 0.72, rect.height * 0.48),
    ),
    labelWidth: Math.max(10, labelWidth),
    changeWidth: Math.max(10, changeWidth),
    capWidth: Math.max(10, capWidth),
  }
}

function HeatmapSkeletonTile({ node }: { node: HeatmapNode }) {
  const { rect } = node
  const {
    compact,
    tiny,
    iconOnly,
    large,
    huge,
    showCap,
    iconSize,
    labelWidth,
    changeWidth,
    capWidth,
  } = getSkeletonContent(rect)
  const micro = rect.width < 18 || rect.height < 18
  const gap = micro ? 1.5 : tiny ? 1.4 : 1

  return (
    <Skeleton
      style={{
        left: rect.x + gap,
        top: rect.y + gap,
        width: Math.max(rect.width - gap * 2, 0),
        height: Math.max(rect.height - gap * 2, 0),
      }}
      className={cn(
        'absolute flex overflow-hidden rounded-none',
        tiny ? 'p-0.5' : 'p-1.5',
      )}
    >
      <div className='flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-1.5'>
        {(iconOnly || !tiny) && (
          <Skeleton
            className='shrink-0 rounded-full brightness-150'
            style={{ width: iconSize, height: iconSize }}
          />
        )}

        {!iconOnly && (
          <Skeleton
            className={cn(
              'shrink-0 rounded-sm brightness-150',
              huge ? 'h-7' : large ? 'h-5' : compact ? 'h-2.5' : 'h-3.5',
            )}
            style={{ width: labelWidth }}
          />
        )}

        {!tiny && !iconOnly && (
          <Skeleton
            className={cn(
              'shrink-0 rounded-sm brightness-150',
              huge ? 'h-6' : large ? 'h-4' : compact ? 'h-2.5' : 'h-3',
            )}
            style={{ width: changeWidth }}
          />
        )}

        {showCap && (
          <Skeleton
            className={cn(
              'shrink-0 rounded-sm brightness-150',
              huge ? 'h-3.5' : 'h-2.5',
            )}
            style={{ width: capWidth }}
          />
        )}
      </div>
    </Skeleton>
  )
}

function HeatmapSkeleton({ height, width }: { height: number; width: number }) {
  const nodes = useMemo(() => {
    if (!width || !height) return []

    return splitTreemap(SKELETON_ITEMS, {
      x: 0,
      y: 0,
      width,
      height,
    })
  }, [height, width])

  return (
    <div className='absolute inset-0 bg-neutral-950'>
      {nodes.map((node) => (
        <HeatmapSkeletonTile key={node.coin.id} node={node} />
      ))}
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
  const { compact, tiny, iconOnly, large, huge } = getTileFlags(rect)
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
        <HeatmapSkeleton height={size.height} width={size.width} />
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
