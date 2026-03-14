import { http } from '@/shared/lib/axios-config'
import type { CoinsList } from '../types/coins-list'
import type { Coin } from '../types/coin'
import type { Category } from '../types/categories'

export const coinsApi = {
  async getCoins({
    page,
    per_page,
    category,
  }: {
    page: number
    per_page: number
    category?: string
  }): Promise<CoinsList[]> {
    const { data } = await http.get<CoinsList[]>('/coins/markets', {
      params: {
        vs_currency: 'usd',
        sparkline: true,
        price_change_percentage: '1h,7d,30d,1y',
        page,
        per_page,
        category,
      },
    })
    return data
  },

  async getCoin(id: string): Promise<Coin> {
    const { data } = await http.get<Coin>(`/coins/${id}`)
    return data
  },

  async getCategoriesList(): Promise<Category[]> {
    const { data } = await http.get<Category[]>('/coins/categories/list')
    return data
  },
}
