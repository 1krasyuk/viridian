import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
  timeout: 10000,
  params: {
    x_cg_demo_api_key: import.meta.env.VITE_CG_API_KEY,
  },
})

export const fmpHttp = axios.create({
  baseURL:
    import.meta.env.VITE_FMP_API_BASE_URL ??
    'https://financialmodelingprep.com/stable/',
  timeout: 10000,
  params: {
    apikey: import.meta.env.VITE_FMP_API_KEY,
  },
})

export const fearGreedHttp = axios.create({
  baseURL: 'https://api.alternative.me/fng/',
  timeout: 10000,
})
