import { http } from '@/shared/lib/axios-config'
import type { Coin } from '../types/coins'

export const coinsApi = {
  async getCoins(): Promise<Coin[]> {
    const { data } = await http.get<Coin[]>('/coins/markets', {
      params: { vs_currency: 'usd' },
    })
    return data
  },

  async getCoin(id: number): Promise<Coin> {
    const { data } = await http.get<Coin>(`/coins/${id}`)
    return data
  },
}
