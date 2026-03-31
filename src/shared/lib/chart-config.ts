import { ColorType } from 'lightweight-charts'

export type ChartTheme = 'light' | 'dark'

export const getChartColors = (isDark: boolean) => ({
  background: isDark ? '#09090b' : '#ffffff',
  text: isDark ? '#fafafa' : '#202024',
  grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  line: isDark ? '#52d4ad' : '#0d9f7d',
  areaTop: isDark ? 'rgba(82, 212, 173, 0.5)' : 'rgba(13, 159, 125, 0.4)',
  areaBottom: isDark ? 'rgba(82, 212, 173, 0.02)' : 'rgba(13, 159, 125, 0.02)',
})

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
      vertLine: {
        color: colors.line,
        labelBackgroundColor: colors.line,
      },
      horzLine: {
        color: colors.line,
        labelBackgroundColor: colors.line,
      },
    },
    rightPriceScale: {
      borderColor: colors.grid,
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
    lastValueVisible: false,
    priceLineVisible: false,
  }) as const
