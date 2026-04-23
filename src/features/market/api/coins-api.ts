import { http } from '@/shared/lib/axios-config'
import type { CoinsList } from '../types/coins-list'
import type { Coin } from '../types/coin'
import type { Category } from '../types/categories'
import type { CoinChartRaw } from '../types/coin-chart'

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

  async getCoinChart(id: string, days: string): Promise<CoinChartRaw> {
    const { data } = await http.get<CoinChartRaw>(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
      },
    })
    return data
  },

  async getCoinOHLC(id: string, days: string): Promise<number[][]> {
    const { data } = await http.get<number[][]>(`/coins/${id}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days,
      },
    })
    return data
  },

  async getCoinCurrentPrice(id: string): Promise<{
    price: number
    marketCap: number
    volume: number
    timestamp: number
  }> {
    const { data } = await http.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    })
    return {
      price: data.market_data.current_price.usd,
      marketCap: data.market_data.market_cap.usd,
      volume: data.market_data.total_volume.usd,
      timestamp: Date.now(),
    }
  },

  async getCategoriesList(): Promise<Category[]> {
    const { data } = await http.get<Category[]>('/coins/categories/list')
    return data
  },
}
