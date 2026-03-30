import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'
import type { CoinChartRaw } from '../types/coin-chart'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: string) => ['coins', id] as const,
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

export function useCoinChart(id: string) {
  return useQuery({
    queryKey: [coinsKeys.detail(id), 'chart'],
    queryFn: () => coinsApi.getCoinChart(id),
    select: (data: CoinChartRaw) => {
      return {
        ...data,
        prices: data.prices
          .map((price) => ({
            time: price[0] / 1000,
            value: price[1],
          }))
          .sort((a, b) => a.time - b.time)
          .filter(
            (item, index, arr) =>
              index === 0 || item.time !== arr[index - 1].time,
          ),
        market_caps: data.market_caps.map((price) => ({
          time: new Date(price[0]).toISOString(),
          value: price[1],
        })),
        total_volumes: data.total_volumes.map((price) => ({
          time: new Date(price[0]).toISOString(),
          value: price[1],
        })),
      }
    },
    enabled: !!id,
  })
}

export function useCategoriesList() {
  return useQuery({
    queryKey: ['coin-categories-list'],
    queryFn: () => coinsApi.getCategoriesList(),
  })
}
