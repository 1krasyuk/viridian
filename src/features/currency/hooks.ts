import { useCurrencyStore } from './store'

interface FormatOptions {
  notation?: 'standard' | 'compact'
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  prefix?: string
  suffix?: string
  sign?: boolean
}

const SYMBOLS: Record<string, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  jpy: '¥',
  cny: '¥',
  rub: '₽',
  uah: '₴',
  kzt: '₸',
  chf: 'Fr',
  cad: 'C$',
  aud: 'A$',
  btc: '₿',
}

const ZERO_DECIMAL = ['jpy', 'cny', 'krw', 'vnd']

const CRYPTO = ['btc', 'eth', 'ltc', 'bch', 'xrp', 'sol', 'dot']

export function useCurrency() {
  const currency = useCurrencyStore((s) => s.currency)
  const setCurrency = useCurrencyStore((s) => s.setCurrency)

  const getValue = (
    record: Record<string, number> | null | undefined,
  ): number | null => {
    if (!record) return null
    return record[currency] ?? record['usd'] ?? null
  }

  const format = (
    value: number | null | undefined,
    opts: FormatOptions = {},
  ): string => {
    if (value == null || !isFinite(value)) return '—'

    const {
      notation = 'standard',
      maximumFractionDigits = 2,
      minimumFractionDigits = 2,
      prefix,
      suffix,
      sign,
    } = opts

    if (prefix || suffix || sign) {
      const num = new Intl.NumberFormat('en', {
        notation,
        maximumFractionDigits,
        minimumFractionDigits,
      }).format(Math.abs(value))

      const signStr = sign ? (value >= 0 ? '+' : '-') : ''
      return `${signStr}${prefix ?? ''}${num}${suffix ? ` ${suffix}` : ''}`
    }

    const c = currency.toLowerCase()
    const isCrypto = CRYPTO.includes(c)
    const isZero = ZERO_DECIMAL.includes(c)

    const digits =
      isCrypto && notation === 'standard' ? 6 : maximumFractionDigits
    const max = isZero ? 0 : digits
    const min = isZero ? 0 : minimumFractionDigits

    const num = new Intl.NumberFormat('en', {
      notation,
      maximumFractionDigits: max,
      minimumFractionDigits: min,
    }).format(value)

    const sym = SYMBOLS[c]
    return sym ? `${sym}${num}` : `${num} ${c.toUpperCase()}`
  }

  const f = (
    record: Record<string, number> | null | undefined,
    opts?: FormatOptions,
  ): string => format(getValue(record), opts)

  return { currency, setCurrency, getValue, format, f }
}
