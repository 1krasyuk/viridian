import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

import { useCurrency } from '@/features/currency/hooks'
import {
  useCategoriesList,
  useCoins,
} from '@/features/market/hooks/coins-queries'
import {
  formatPercent,
  getChange,
  isChangeInRanges,
} from '../utils/heatmap-utils'
import { HeatmapSummaryBar } from './heatmap-summary-bar'
import { HeatmapToolbar } from './heatmap-toolbar'
import {
  DEFAULT_CHANGE_RANGES,
  DEFAULT_HEATMAP_PERIOD,
  DEFAULT_HEATMAP_SIZE,
  MAX_HEATMAP_COINS,
  type ChangeRangeId,
  type HeatmapPeriod,
  type HeatmapSizeMetric,
} from '../types/heatmap-types'
import { HeatmapRenderer } from './heatmap-renderer'

export function HeatmapPage() {
  const { currency, format } = useCurrency()
  const search = useSearch({ from: '/heatmap' })
  const navigate = useNavigate({ from: '/heatmap' })
  const [activeRanges, setActiveRanges] = useState<ChangeRangeId[]>([
    ...DEFAULT_CHANGE_RANGES,
  ])

  const period = search.period ?? DEFAULT_HEATMAP_PERIOD
  const sizeMetric = search.size ?? DEFAULT_HEATMAP_SIZE
  const category = search.category

  const { data = [], isLoading, isError } = useCoins(
    1,
    MAX_HEATMAP_COINS,
    category,
    currency,
  )
  const { data: categories = [] } = useCategoriesList()

  const coins = data
    .filter((coin) => coin.market_cap || coin.total_volume)
    .filter((coin) => isChangeInRanges(getChange(coin, period), activeRanges))
    .slice(0, MAX_HEATMAP_COINS)

  const totalCap = coins.reduce((acc, coin) => acc + (coin.market_cap ?? 0), 0)
  const advancers = coins.filter((coin) => (getChange(coin, period) ?? 0) > 0)
  const decliners = coins.length - advancers.length
  const averageChange =
    coins.reduce((acc, coin) => acc + (getChange(coin, period) ?? 0), 0) /
    (coins.length || 1)

  const updateSearch = (
    next: Partial<{
      period: HeatmapPeriod
      size: HeatmapSizeMetric
      category?: string
    }>,
  ) => {
    navigate({
      search: (prev) => {
        const merged = { ...prev, ...next }
        if ('category' in next && next.category === undefined) {
          const rest = { ...merged }
          delete rest.category
          return rest
        }

        return merged
      },
    })
  }

  const resetHeatmap = () => {
    setActiveRanges([...DEFAULT_CHANGE_RANGES])
    navigate({
      search: () => ({
        period: DEFAULT_HEATMAP_PERIOD,
        size: DEFAULT_HEATMAP_SIZE,
      }),
    })
  }

  return (
    <div className='flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden bg-background md:h-dvh'>
      <header className='shrink-0 border-b bg-background px-3 py-2.5 md:py-3'>
        <h1 className='text-xl font-semibold leading-tight tracking-wide md:text-2xl'>
          Heatmap
        </h1>
        <p className='text-xs font-normal text-muted-foreground md:text-sm'>
          Size shows market weight, color shows selected price change.
        </p>
      </header>

      <HeatmapToolbar
        period={period}
        sizeMetric={sizeMetric}
        category={category}
        categories={categories}
        activeRanges={activeRanges}
        onPeriodChange={(value) => updateSearch({ period: value })}
        onSizeMetricChange={(value) => updateSearch({ size: value })}
        onCategoryChange={(value) => updateSearch({ category: value })}
        onRangesChange={setActiveRanges}
        onReset={resetHeatmap}
        isLoading={isLoading}
      />

      <main className='min-h-0 flex-1 overflow-hidden'>
        <HeatmapRenderer
          coins={coins}
          period={period}
          sizeMetric={sizeMetric}
          format={format}
          isLoading={isLoading}
          isError={isError}
        />
      </main>

      <HeatmapSummaryBar
        averageChange={formatPercent(averageChange)}
        averageTone={averageChange >= 0 ? 'positive' : 'negative'}
        advancers={advancers.length}
        decliners={decliners}
        totalCoins={coins.length}
        totalCap={format(totalCap, { notation: 'compact' })}
        modeLabel={`${period} / ${
          sizeMetric === 'market_cap' ? 'Market cap' : 'Volume'
        } / ${activeRanges.length} ranges`}
        isLoading={isLoading}
      />
    </div>
  )
}
