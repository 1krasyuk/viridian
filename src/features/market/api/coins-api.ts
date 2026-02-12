import { http } from '@/shared/lib/axios-config'
import type { Coin } from '../types/coins'

export const coinsApi = {
  async getCoins({
    page,
    per_page,
  }: {
    page: number
    per_page: number
  }): Promise<Coin[]> {
    const { data } = await http.get<Coin[]>('/coins/markets', {
      params: {
        vs_currency: 'usd',
        sparkline: true,
        page,
        per_page,
      },
    })
    return data
  },

  async getCoin(id: number): Promise<Coin> {
    const { data } = await http.get<Coin>(`/coins/${id}`)
    return data
  },
}
