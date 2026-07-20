import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'
import type { CoinChart, CoinChartRaw } from '../types/coin-chart'
import type { UTCTimestamp } from 'lightweight-charts'
import type { OhlcData } from 'lightweight-charts'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: string) => ['coins', id] as const,
  global: ['global'] as const,
  search: (query: string) => ['coins', 'search', query] as const,
}

export function useCoinSearch(query: string) {
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: coinsKeys.search(normalizedQuery),
    queryFn: () => coinsApi.search(normalizedQuery),
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCoins(
  page: number,
  per_page: number,
  category?: string,
  currency: string = 'usd',
  enabled: boolean = true,
  staleTime: number = 0,
  refetchInterval: number | false = 60000,
  gcTime: number = 300000,
  ids?: string,
  refetchOnWindowFocus: boolean = true,
) {
  return useQuery({
    queryKey: [coinsKeys.all, page, per_page, category, currency, ids],
    queryFn: () =>
      coinsApi.getCoins({
        page,
        per_page,
        category,
        vs_currency: currency,
        ids,
      }),
    staleTime,
    refetchInterval,
    gcTime,
    enabled,
    refetchOnWindowFocus,
  })
}

export function useCoin(id: string) {
  return useQuery({
    queryKey: coinsKeys.detail(id),
    queryFn: () => coinsApi.getCoin(id),
    enabled: !!id,
  })
}

export function useCoinChart(
  id: string,
  days: string,
  currency: string = 'usd',
) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'chart', days, currency],
    queryFn: () => coinsApi.getCoinChart(id, days, currency),
    select: (data: CoinChartRaw): CoinChart => {
      const mapToSeries = (data: number[][]) =>
        data.map(([time, value]) => ({
          time: (time / 1000) as UTCTimestamp,
          value,
        }))

      const mapToBillions = (data: number[][]) =>
        data.map(([time, value]) => ({
          time: (time / 1000) as UTCTimestamp,
          value: value / 1_000_000_000,
        }))

      return {
        ...data,
        prices: mapToSeries(data.prices),
        market_caps: mapToBillions(data.market_caps),
        total_volumes: mapToBillions(data.total_volumes),
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchIntervalInBackground: false,
  })
}

export function useCoinOHLC(
  id: string,
  days: string,
  enabled: boolean,
  currency: string = 'usd',
) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'ohlc', days, currency],
    queryFn: () => coinsApi.getCoinOHLC(id, days, currency),
    select: (data: number[][]): OhlcData[] => {
      return data.map(([time, open, high, low, close]) => ({
        time: (time / 1000) as UTCTimestamp,
        open,
        high,
        low,
        close,
      }))
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  })
}

export function useCoinCurrentPrice(
  id: string,
  enabled: boolean,
  currency: string = 'usd',
) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'current', currency],
    queryFn: () => coinsApi.getCoinCurrentPrice(id, currency),
    enabled: enabled && !!id,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  })
}

export function useCategoriesList() {
  return useQuery({
    queryKey: ['coin-categories-list'],
    queryFn: () => coinsApi.getCategoriesList(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useGlobalData() {
  return useQuery({
    queryKey: coinsKeys.global,
    queryFn: () => coinsApi.getGlobalData(),
    staleTime: 5000,
    refetchInterval: 50000,
  })
}

export function useTrending({
  refetchInterval = 60000,
  staleTime = 30000,
  refetchOnWindowFocus = true,
  enabled = true,
}: {
  refetchInterval?: number | false
  staleTime?: number
  refetchOnWindowFocus?: boolean
  enabled?: boolean
} = {}) {
  return useQuery({
    queryKey: ['trending'],
    queryFn: () => coinsApi.getTrending(),
    refetchInterval,
    staleTime,
    refetchOnWindowFocus,
    enabled,
  })
}

export function useCoinMarketChart(
  id: string,
  days: string = '7',
  currency: string = 'usd',
) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'market-chart', days, currency],
    queryFn: () => coinsApi.getCoinMarketChart(id, days, currency),
    enabled: !!id,
    staleTime: 300000,
    refetchInterval: 300000,
  })
}

export function useFearGreed() {
  return useQuery({
    queryKey: ['fear-greed'],
    queryFn: () => coinsApi.getFearGreed(),
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
  })
}
