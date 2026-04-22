// routes/coins/$coinId.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCoin, useCoinChart } from '@/features/market/hooks/coins-queries'
import { CoinChart } from '@/features/market/components/coin-page/coin-chart'
import { CoinConverter } from '@/features/market/components/coin-page/coin-converter'
import { CoinDescription } from '@/features/market/components/coin-page/coin-description'
import { CoinHeader } from '@/features/market/components/coin-page/coin-header'
import { CoinInfo } from '@/features/market/components/coin-page/coin-info'
import { CoinPricePerformance } from '@/features/market/components/coin-page/coin-price-perfomance'
import { CoinSentiment } from '@/features/market/components/coin-page/coin-sentiment'
import { CoinStatistics } from '@/features/market/components/coin-page/coin-statistics'
import { CoinTickersTable } from '@/features/market/components/coin-page/coin-tickers-table'

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui/resizable'
import { LayoutGrid, TerminalSquare } from 'lucide-react'
import { CoinPriceChange } from '@/features/market/components/coin-page/coin-price-change'

export const Route = createFileRoute('/coins/$coinId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coinId } = Route.useParams()
  const { data, isLoading: isLoadingCoin } = useCoin(coinId)
  const [days, setDays] = useState('1')
  const [dataType, setDataType] = useState<'price' | 'marketCap'>('price')

  const { data: dataChart, isLoading: isLoadingChart } = useCoinChart(
    coinId,
    days,
  )
  const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>(
    () =>
      (localStorage.getItem('coin-view-mode') as 'pagination' | 'infinite') ||
      'pagination',
  )

  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    localStorage.setItem('coin-view-mode', mode)
  }

  return (
    <div className='flex min-h-screen'>
      {/* LEFT */}
      <div className='w-3/4 flex flex-col'>
        {/* TOGGLE */}
        <div className='flex justify-start p-4 border-b'>
          <ToggleGroup
            type='single'
            value={viewMode}
            onValueChange={(value) =>
              value && handleModeChange(value as 'pagination' | 'infinite')
            }
          >
            <ToggleGroupItem
              variant='outline'
              value='pagination'
              className='h-8 px-3 text-sm gap-2'
            >
              <LayoutGrid className='h-4 w-4' />
              Сlassic mode
            </ToggleGroupItem>
            <ToggleGroupItem
              variant='outline'
              value='infinite'
              className='h-8 px-3 text-sm gap-2'
            >
              <TerminalSquare className='h-4 w-4' />
              Terminal mode
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {viewMode === 'pagination' ? (
          /* Classic mode */
          <div className='flex flex-col min-w-0'>
            <div className='h-150 min-w-0 relative w-full'>
              <CoinChart
                chart={dataChart}
                symbol={data?.symbol}
                days={days}
                onDaysChange={setDays}
                dataType={dataType}
                onDataTypeChange={setDataType}
                isLoading={isLoadingChart}
                mode='classic'
              />
            </div>
            <div className='flex flex-col p-5 gap-5'>
              <CoinPriceChange coin={data} isLoading={isLoadingCoin} />
              <CoinDescription
                description={data?.description}
                isLoading={isLoadingCoin}
              />
              <CoinTickersTable
                coinName={data?.name || ''}
                tickers={data?.tickers ?? []}
                loading={isLoadingCoin}
                mode='pagination'
              />
            </div>
          </div>
        ) : (
          /* Terminal mode */
          <ResizablePanelGroup orientation='vertical'>
            <ResizablePanel
              defaultSize='70%'
              minSize='35%'
              className='min-h-0 min-w-0'
            >
              <div className='h-full min-h-0 min-w-0'>
                <CoinChart
                  chart={dataChart}
                  symbol={data?.symbol}
                  days={days}
                  onDaysChange={setDays}
                  dataType={dataType}
                  onDataTypeChange={setDataType}
                  isLoading={isLoadingChart}
                  mode='terminal'
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize='30%' minSize='15%'>
              <div className='relative h-full overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30'>
                <div className='py-5'>
                  <CoinTickersTable
                    coinName={data?.name || ''}
                    tickers={data?.tickers ?? []}
                    loading={isLoadingCoin}
                    mode='infinite'
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* RIGHT */}
      <div className='min-w-1/4 sticky top-0 h-screen flex flex-col border-l'>
        <div className='bg-background px-5 pt-5 pb-6 relative'>
          <CoinHeader coin={data} isLoading={isLoadingCoin} days={days} />
        </div>

        <div className='flex-1 overflow-y-auto no-scrollbar px-5 pb-5 flex flex-col gap-3'>
          <CoinStatistics coin={data} isLoading={isLoadingCoin} />
          <CoinInfo coin={data} isLoading={isLoadingCoin} />
          <CoinSentiment coin={data} isLoading={isLoadingCoin} />
          <CoinPricePerformance coin={data} isLoading={isLoadingCoin} />
          <CoinConverter coin={data} isLoading={isLoadingCoin} />
        </div>
      </div>
    </div>
  )
}
