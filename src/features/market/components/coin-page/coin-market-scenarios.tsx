import { useMemo, useState } from 'react'
import type { Coin } from '@/features/market/types/coin'
import {
  buildScenarios,
  getVolatilityProfile,
  stddev,
} from './coin-market-scenarios/scenario-model'
import { ScenarioControls } from './coin-market-scenarios/scenario-controls'
import { ScenarioHeader } from './coin-market-scenarios/scenario-header'
import { ScenarioMetrics } from './coin-market-scenarios/scenario-metrics'
import { ScenarioTable } from './coin-market-scenarios/scenario-table'
import { useCurrency } from '@/features/currency/hooks'

interface CoinMarketScenariosProps {
  coin: Coin | undefined
  isLoading: boolean
}

export function CoinMarketScenarios({
  coin,
  isLoading,
}: CoinMarketScenariosProps) {
  const { getValue } = useCurrency()

  const [investment, setInvestment] = useState('1000')
  const [months, setMonths] = useState(12)
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)

  const marketData = coin?.market_data

  const currentPrice = getValue(marketData?.current_price) ?? 0
  const marketCap = getValue(marketData?.market_cap) ?? 0
  const volume = getValue(marketData?.total_volume) ?? 0
  const ath = getValue(marketData?.ath) ?? 0
  const athDistance = ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0

  const p24 = getValue(marketData?.price_change_percentage_24h_in_currency) ?? 0
  const p7 = getValue(marketData?.price_change_percentage_7d_in_currency) ?? 0
  const p30 = getValue(marketData?.price_change_percentage_30d_in_currency) ?? 0
  const p1y = getValue(marketData?.price_change_percentage_1y_in_currency) ?? 0

  const volatility = useMemo(() => stddev([p24, p7, p30]), [p24, p7, p30])
  const trendScore = useMemo(
    () => p7 * 0.2 + p30 * 0.5 + p1y * 0.3,
    [p7, p30, p1y],
  )
  const investNum = parseFloat(investment) || 0

  const scenarios = useMemo(
    () =>
      buildScenarios({
        currentPrice,
        investment: investNum,
        months,
        marketCap,
        volume,
        trendScore,
        volatility,
        athDistance,
      }),
    [
      currentPrice,
      investNum,
      months,
      marketCap,
      volume,
      trendScore,
      volatility,
      athDistance,
    ],
  )

  const volProfile = getVolatilityProfile(volatility)
  const isLoadingAny = isLoading || !coin?.market_data

  return (
    <div className='space-y-5'>
      <ScenarioHeader />
      <ScenarioControls
        investment={investment}
        onInvestmentChange={setInvestment}
        months={months}
        onMonthsChange={setMonths}
        isLoading={isLoadingAny}
      />
      <ScenarioMetrics
        volatility={volatility}
        trendScore={trendScore}
        volProfile={volProfile}
        isLoading={isLoadingAny}
      />
      <ScenarioTable
        scenarios={scenarios}
        currentPrice={currentPrice}
        investment={investNum}
        expandedScenario={expandedScenario}
        onExpandedScenarioChange={setExpandedScenario}
        isLoading={isLoadingAny}
      />
      <div className='rounded-xl bg-muted/20 border border-border/20 p-3'>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          <span className='font-semibold text-foreground'>Note: </span>
          Probabilistic simulations based on market structure and historical
          behavior. Not financial advice. Reliability decreases beyond 24
          months.
        </p>
      </div>
    </div>
  )
}
