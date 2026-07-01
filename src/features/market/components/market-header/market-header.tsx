import {
  useGlobalData,
  useTrending,
} from '@/features/market/hooks/coins-queries'
import { MarketTicker } from './market-ticker'
import { MarketWidgets } from './market-widgets'

export function MarketHeader() {
  const { data: globalData, isLoading: globalLoading } = useGlobalData()
  const { data: trendingData, isLoading: trendingLoading } = useTrending()

  return (
    <div className='space-y-3'>
      <MarketTicker data={trendingData} isLoading={trendingLoading} />
      <MarketWidgets data={globalData} isLoading={globalLoading} />
    </div>
  )
}
