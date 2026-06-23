import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'
import type { CoinChart, CoinChartRaw } from '../types/coin-chart'
import type { UTCTimestamp } from 'lightweight-charts'
import type { OhlcData } from 'lightweight-charts'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: string) => ['coins', id] as const,
  global: ['global'] as const,
}

export function useCoins(
  page: number,
  per_page: number,
  category?: string,
  currency: string = 'usd',
) {
  return useQuery({
    queryKey: [coinsKeys.all, page, per_page, category, currency],
    queryFn: () =>
      coinsApi.getCoins({
        page,
        per_page,
        category,
        vs_currency: currency,
      }),
    refetchInterval: 60000,
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
    gcTime: 0,
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
    gcTime: 0,
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
