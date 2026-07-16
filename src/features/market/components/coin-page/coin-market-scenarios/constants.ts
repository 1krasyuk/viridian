export const INVESTMENT_PRESETS = [500, 1000, 2500, 5000, 10000, 25000]

export const HORIZON_PRESETS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
  { label: '3Y', months: 36 },
]

export const SCENARIO_META = {
  bear: {
    tooltip:
      'Models a risk-off market with declining liquidity and expanding BTC dominance. Uses historical bear market drawdowns scaled by current volatility.',
  },
  base: {
    tooltip:
      'Models normal market continuation based on historical median performance for this market cap tier. Most statistically probable outcome.',
  },
  bull: {
    tooltip:
      'Models euphoric bull cycle with aggressive capital inflows and speculative momentum. Based on historical bull run peaks for this tier.',
  },
} as const

export const COLUMN_TOOLTIPS = {
  scenario: 'Three market regimes based on historical behavior patterns',
  priceRange: 'Projected price range relative to current price.',
  valueRange: 'Portfolio value range based on your investment.',
  roiRange: 'Return on investment range for the selected period',
  probability:
    'Statistical confidence based on data quality, market cap tier, and time horizon',
} as const
