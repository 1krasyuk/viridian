import { useQuery } from '@tanstack/react-query'
import { coinsApi } from '../api/coins-api'

export const coinsKeys = {
  all: ['coins'] as const,
  detail: (id: number) => ['coins', id] as const,
}

export function useCoins() {
  return useQuery({
    queryKey: coinsKeys.all,
    queryFn: coinsApi.getCoins,
  })
}

export function useCoin(id: number) {
  return useQuery({
    queryKey: coinsKeys.detail(id),
    queryFn: () => coinsApi.getCoin(id),
    enabled: !!id,
  })
}
