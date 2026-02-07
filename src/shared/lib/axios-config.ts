import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
  timeout: 10000,
  params: {
    'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY,
  },
})
