import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'
import type { CoinChart, CoinChartRaw } from '../types/coin-chart'
import type { UTCTimestamp } from 'lightweight-charts'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: string) => ['coins', id] as const,
  global: ['global'] as const, // ← ДОБАВИТЬ ЭТО
}

export function useCoins(page: number, per_page: number, category?: string) {
  return useQuery({
    queryKey: [coinsKeys.all, page, per_page, category],
    queryFn: () => coinsApi.getCoins({ page, per_page, category }),
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

export function useCoinChart(id: string, days: string) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'chart', days],
    queryFn: () => coinsApi.getCoinChart(id, days),
    select: (data: CoinChartRaw): CoinChart => {
      const mapToSeries = (data: number[][]) =>
        data.map(([time, value]) => ({
          time: (time / 1000) as UTCTimestamp,
          value,
        }))

      return {
        ...data,
        prices: mapToSeries(data.prices),
        market_caps: mapToSeries(data.market_caps),
        total_volumes: mapToSeries(data.total_volumes),
      }
    },
    enabled: !!id,
    gcTime: 0,
    refetchIntervalInBackground: false,
  })
}

import type { OhlcData } from 'lightweight-charts'

export function useCoinOHLC(id: string, days: string, enabled: boolean) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'ohlc', days],
    queryFn: () => coinsApi.getCoinOHLC(id, days),
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

export function useCoinCurrentPrice(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'current'],
    queryFn: () => coinsApi.getCoinCurrentPrice(id),
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
