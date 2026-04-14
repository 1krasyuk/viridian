import { ColorType } from 'lightweight-charts'

export type ChartTheme = 'light' | 'dark'

export const getChartColors = (isDark: boolean) => ({
  background: isDark ? '#09090b' : '#ffffff',
  text: isDark ? '#fafafa' : '#202024',
  grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  positive: isDark ? '#52d4ad' : '#0d9f7d',
  negative: isDark ? '#ef4444' : '#dc2626',
  areaTopPositive: isDark
    ? 'rgba(82, 212, 173, 0.5)'
    : 'rgba(13, 159, 125, 0.4)',
  areaBottomPositive: isDark
    ? 'rgba(82, 212, 173, 0.02)'
    : 'rgba(13, 159, 125, 0.02)',
  areaTopNegative: isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.4)',
  areaBottomNegative: isDark
    ? 'rgba(239, 68, 68, 0.02)'
    : 'rgba(220, 38, 38, 0.02)',
  crosshair: isDark ? '#6b7280' : '#d1d5db',
  baseLine: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
})

export const formatPrice = (price: number) => {
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  if (price >= 0.0001) return price.toFixed(6)
  return price.toExponential(2)
}

export const getLineColor = (
  prices: { value: number }[],
  colors: ReturnType<typeof getChartColors>,
) => {
  if (prices.length < 2) return colors.positive

  const first = prices[0].value
  const last = prices[prices.length - 1].value
  const change = last - first

  return change >= 0 ? colors.positive : colors.negative
}

export const createChartOptions = (
  colors: ReturnType<typeof getChartColors>,
  days: string,
) =>
  ({
    autoSize: true,
    handleScroll: false,
    handleScale: false,
    layout: {
      attributionLogo: false,
      background: {
        type: ColorType.Solid,
        color: colors.background,
      },
      textColor: colors.text,
      fontFamily: "'Nunito Sans Variable', sans-serif",
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: colors.grid },
    },
    crosshair: {
      mode: 0,
      vertLine: {
        color: colors.crosshair,
        width: 1,
        style: 2,
        labelBackgroundColor: colors.crosshair,
      },
      horzLine: {
        color: colors.crosshair,
        width: 1,
        style: 2,
        labelBackgroundColor: colors.crosshair,
      },
    },
    rightPriceScale: {
      borderColor: colors.grid,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: {
      borderColor: colors.grid,
      timeVisible: true,
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000)
        if (days === '1') {
          const hours = date.getHours()
          const minutes = date.getMinutes()

          if (hours === 0 && minutes < 30) {
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          }

          const ampm = hours >= 12 ? 'PM' : 'AM'
          const h = hours % 12 || 12
          return `${h} ${ampm}`
        }

        if (days === '7') {
          return date.toLocaleTimeString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            hour12: true,
          })
        }

        if (days === '30' || days === '90') {
          return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
          })
        }

        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        })
      },
    },
    localization: {
      timeFormatter: (time: number) => {
        const date = new Date(time * 1000)
        return date.toLocaleString('en-GB', {
          year: '2-digit',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      },
      priceFormatter: (price: number) => {
        return formatPrice(price)
      },
    },
  }) as const

export const createAreaSeriesOptions = (
  colors: ReturnType<typeof getChartColors>,
  prices: { value: number }[],
) => {
  const lineColor = getLineColor(prices, colors)
  const isPositive = lineColor === colors.positive

  return {
    lineColor,
    topColor: isPositive ? colors.areaTopPositive : colors.areaTopNegative,
    bottomColor: isPositive
      ? colors.areaBottomPositive
      : colors.areaBottomNegative,
    lineWidth: 2,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'custom' as const,
      formatter: formatPrice,
    },
  } as const
}

export const createBaselineSeriesOptions = (
  colors: ReturnType<typeof getChartColors>,
  baseValue: number,
) =>
  ({
    baseValue: { type: 'price', price: baseValue },
    topLineColor: colors.positive,
    topFillColor1: colors.areaTopPositive,
    topFillColor2: colors.areaBottomPositive,
    bottomLineColor: colors.negative,
    bottomFillColor1: colors.areaBottomNegative,
    bottomFillColor2: colors.areaTopNegative,
    lineWidth: 2,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'custom' as const,
      formatter: formatPrice,
    },
  }) as const

export const createBaseLineOptions = (
  colors: ReturnType<typeof getChartColors>,
) =>
  ({
    color: colors.baseLine,
    lineWidth: 1,
    lineStyle: 2,
    lastValueVisible: true,
    priceLineVisible: false,
  }) as const

export const formatMarketCap = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value)
}

export const createLineSeriesOptions = (
  colors: ReturnType<typeof getChartColors>,
  isMarketCap: boolean = false,
) => {
  return {
    color: isMarketCap ? '#3b82f6' : colors.positive,
    lineWidth: 2,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'custom' as const,
      formatter: isMarketCap ? formatMarketCap : formatPrice,
    },
  } as const
}
