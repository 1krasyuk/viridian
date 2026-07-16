import { ChartNoAxesCombined } from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { useCryptoNews } from '@/features/news/hooks/news-queries'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { useCoins } from '../../hooks/coins-queries'
import { MarketBreadth } from './market-breadth'
import { MarketConcentration } from './market-concentration'
import { MarketLatestNews } from './market-latest-news'
import { MarketLiquidityOverview } from './market-liquidity-overview'
import { MarketPerformanceLeaders } from './market-performance-leaders'
import { MarketVolumeLeaders } from './market-volume-leaders'

export function MarketFooter() {
  const { currency } = useCurrency()
  const { data: coins = [], isLoading: coinsLoading } = useCoins(
    1,
    250,
    undefined,
    currency,
    true,
    60_000,
    false,
  )
  const {
    data: news,
    isLoading: newsLoading,
    isError: newsError,
  } = useCryptoNews('general')

  return (
    <TooltipProvider delayDuration={100}>
      <footer className='space-y-3 px-3 py-3'>
        <div className='flex items-center gap-3 px-1 pb-1'>
          <div className='w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center border border-emerald-500/10'>
            <ChartNoAxesCombined className='h-6 w-6 text-emerald-500' />
          </div>
          <div>
            <h2 className='text-2xl font-semibold tracking-tight'>
              Market insights
            </h2>
            <p className='text-sm text-muted-foreground'>
              Broader signals and activity across the top 250 assets.
            </p>
          </div>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          <MarketBreadth coins={coins} isLoading={coinsLoading} />
          <MarketVolumeLeaders coins={coins} isLoading={coinsLoading} />
        </div>
        <div className='grid gap-3 xl:grid-cols-3'>
          <MarketConcentration coins={coins} isLoading={coinsLoading} />
          <MarketLiquidityOverview coins={coins} isLoading={coinsLoading} />
          <MarketPerformanceLeaders coins={coins} isLoading={coinsLoading} />
        </div>
        <MarketLatestNews
          articles={news?.articles.slice(0, 4) ?? []}
          isLoading={newsLoading}
          isError={newsError}
        />
      </footer>
    </TooltipProvider>
  )
}
