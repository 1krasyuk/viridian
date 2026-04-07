import { ColorType } from 'lightweight-charts'

export type ChartTheme = 'light' | 'dark'

export const getChartColors = (isDark: boolean) => ({
  background: isDark ? '#09090b' : '#ffffff',
  text: isDark ? '#fafafa' : '#202024',
  grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  line: isDark ? '#52d4ad' : '#0d9f7d',
  lineNegative: isDark ? '#ef4444' : '#dc2626',
  areaTop: isDark ? 'rgba(82, 212, 173, 0.5)' : 'rgba(13, 159, 125, 0.4)',
  areaBottom: isDark ? 'rgba(82, 212, 173, 0.02)' : 'rgba(13, 159, 125, 0.02)',
  areaTopNegative: isDark
    ? 'rgba(239, 68, 68, 0.02)'
    : 'rgba(220, 38, 38, 0.02)',
  areaBottomNegative: isDark
    ? 'rgba(239, 68, 68, 0.5)'
    : 'rgba(220, 38, 38, 0.4)',
  crosshair: isDark ? '#6b7280' : '#d1d5db',
  baseLine: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
})

export const formatPrice = (price: number) => {
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  if (price >= 0.0001) return price.toFixed(6)

  return price.toExponential(2)
}

export const createChartOptions = (colors: ReturnType<typeof getChartColors>) =>
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
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: colors.grid,
      timeVisible: true,
    },
  }) as const

export const createAreaSeriesOptions = (
  colors: ReturnType<typeof getChartColors>,
) =>
  ({
    lineColor: colors.line,
    topColor: colors.areaTop,
    bottomColor: colors.areaBottom,
    lineWidth: 2,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'custom',
      formatter: formatPrice,
    },
  }) as const

export const createBaselineSeriesOptions = (
  colors: ReturnType<typeof getChartColors>,
  baseValue: number,
) =>
  ({
    baseValue: { type: 'price', price: baseValue },
    topLineColor: colors.line,
    topFillColor1: colors.areaTop,
    topFillColor2: colors.areaBottom,
    bottomLineColor: colors.lineNegative,
    bottomFillColor1: colors.areaTopNegative,
    bottomFillColor2: colors.areaBottomNegative,
    lineWidth: 2,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'custom',
      formatter: formatPrice,
    },
  }) as const
