import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = string

export const POPULAR_CURRENCIES: CurrencyCode[] = [
  'usd',
  'eur',
  'gbp',
  'btc',
  'eth',
]

export const FIAT_CURRENCIES: CurrencyCode[] = [
  'usd',
  'aed',
  'ars',
  'aud',
  'bdt',
  'bhd',
  'bmd',
  'brl',
  'cad',
  'chf',
  'clp',
  'cny',
  'czk',
  'dkk',
  'eur',
  'gbp',
  'gel',
  'hkd',
  'huf',
  'idr',
  'ils',
  'inr',
  'jpy',
  'krw',
  'kwd',
  'lkr',
  'mmk',
  'mxn',
  'myr',
  'ngn',
  'nok',
  'nzd',
  'php',
  'pkr',
  'pln',
  'rub',
  'sar',
  'sek',
  'sgd',
  'thb',
  'try',
  'twd',
  'uah',
  'vef',
  'vnd',
  'zar',
]

export const CRYPTO_CURRENCIES: CurrencyCode[] = [
  'btc',
  'eth',
  'ltc',
  'bch',
  'bnb',
  'eos',
  'xrp',
  'xlm',
  'link',
  'dot',
  'yfi',
  'sol',
  'bits',
  'sats',
]

interface CurrencyStore {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'usd',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'viridian-currency' },
  ),
)
