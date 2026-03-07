import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
  timeout: 10000,
  params: {
    x_cg_demo_api_key: import.meta.env.VITE_CG_API_KEY,
  },
})
