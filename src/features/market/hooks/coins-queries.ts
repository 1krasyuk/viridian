import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: number) => ['coins', id] as const,
}

export function useCoins(page: number, per_page: number, category?: string) {
  return useQuery({
    queryKey: [coinsKeys.all, page, per_page, category],
    queryFn: () => coinsApi.getCoins({ page, per_page, category }),
  })
}

export function useCoin(id: number) {
  return useQuery({
    queryKey: coinsKeys.detail(id),
    queryFn: () => coinsApi.getCoin(id),
    enabled: !!id,
  })
}

export function useCategoriesList() {
  return useQuery({
    queryKey: ['coin-categories-list'],
    queryFn: () => coinsApi.getCategoriesList(),
  })
}
