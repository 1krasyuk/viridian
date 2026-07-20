import { fearGreedHttp, http } from '@/shared/lib/axios-config'
import type { CoinsList } from '../types/coins-list'
import type { Coin } from '../types/coin'
import type { Category } from '../types/categories'
import type { CoinChartRaw } from '../types/coin-chart'
import type { GlobalData } from '../types/global'
import type { TrendingResponse } from '../types/trending'
import type { SearchResponse } from '../types/search'

export const coinsApi = {
  async getCoins({
    page,
    per_page,
    category,
    vs_currency = 'usd',
    ids,
  }: {
    page: number
    per_page: number
    category?: string
    vs_currency?: string
    ids?: string
  }): Promise<CoinsList[]> {
    const { data } = await http.get<CoinsList[]>('/coins/markets', {
      params: {
        vs_currency,
        sparkline: true,
        price_change_percentage: '1h,7d,30d,1y',
        page,
        per_page,
        category,
        ids,
      },
    })
    return data
  },

  async getCoin(id: string): Promise<Coin> {
    const { data } = await http.get<Coin>(`/coins/${id}`, {
      params: {
        sparkline: true,
      },
    })
    return data
  },

  async getCoinChart(
    id: string,
    days: string,
    vs_currency: string = 'usd',
  ): Promise<CoinChartRaw> {
    const { data } = await http.get<CoinChartRaw>(`/coins/${id}/market_chart`, {
      params: {
        vs_currency,
        days,
      },
    })
    return data
  },

  async getCoinOHLC(
    id: string,
    days: string,
    vs_currency: string = 'usd',
  ): Promise<number[][]> {
    const { data } = await http.get<number[][]>(`/coins/${id}/ohlc`, {
      params: {
        vs_currency,
        days,
      },
    })
    return data
  },

  async getCoinCurrentPrice(
    id: string,
    vs_currency: string = 'usd',
  ): Promise<{
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
      price:
        data.market_data.current_price[vs_currency] ??
        data.market_data.current_price.usd,
      marketCap:
        data.market_data.market_cap[vs_currency] ??
        data.market_data.market_cap.usd,
      volume:
        data.market_data.total_volume[vs_currency] ??
        data.market_data.total_volume.usd,
      timestamp: Date.now(),
    }
  },

  async getCategoriesList(): Promise<Category[]> {
    const { data } = await http.get<Category[]>('/coins/categories/list')
    return data
  },

  async getGlobalData(): Promise<GlobalData> {
    const { data } = await http.get<{ data: GlobalData }>('/global')
    return data.data
  },

  async getTrending(): Promise<TrendingResponse> {
    const { data } = await http.get<TrendingResponse>('/search/trending')
    return data
  },

  async search(query: string): Promise<SearchResponse> {
    const { data } = await http.get<SearchResponse>('/search', {
      params: { query },
    })
    return data
  },

  async getCoinMarketChart(
    id: string,
    days: string = '7',
    vs_currency: string = 'usd',
  ): Promise<{
    prices: number[][]
    market_caps: number[][]
    total_volumes: number[][]
  }> {
    const { data } = await http.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency,
        days,
      },
    })
    return data
  },

  async getFearGreed(): Promise<{
    value: number
    value_classification: string
    timestamp: string
  }> {
    const { data } = await fearGreedHttp.get<{
      data: Array<{
        value: string
        value_classification: string
        timestamp: string
      }>
    }>('', {
      params: { limit: 1 },
    })
    const result = data.data[0]
    if (!result) throw new Error('Fear & Greed data is unavailable')

    return { ...result, value: Number(result.value) }
  },
}
