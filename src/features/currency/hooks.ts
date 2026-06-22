// src/features/currency/hooks.ts
import { useCurrencyStore } from './store'

interface FormatOptions {
  notation?: 'standard' | 'compact'
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  prefix?: string
  suffix?: string
  sign?: boolean
}

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
      const prefixStr = prefix ? prefix : ''
      const suffixStr = suffix ? ` ${suffix}` : ''

      return `${signStr}${prefixStr}${num}${suffixStr}`
    }

    const isCrypto = ['btc', 'eth', 'ltc', 'bch', 'xrp', 'sol', 'dot'].includes(
      currency,
    )
    const digits =
      isCrypto && notation === 'standard' ? 6 : maximumFractionDigits

    const isZeroDecimal = ['jpy', 'cny'].includes(currency)
    const finalMax = isZeroDecimal ? 0 : digits
    const finalMin = isZeroDecimal ? 0 : minimumFractionDigits

    try {
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency.toUpperCase(),
        notation,
        maximumFractionDigits: finalMax,
        minimumFractionDigits: finalMin,
      }).format(value)
    } catch {
      const num = new Intl.NumberFormat('en', {
        notation,
        maximumFractionDigits: finalMax,
        minimumFractionDigits: finalMin,
      }).format(value)
      return `${currency.toUpperCase()} ${num}`
    }
  }

  const f = (
    record: Record<string, number> | null | undefined,
    opts?: FormatOptions,
  ): string => format(getValue(record), opts)

  return { currency, setCurrency, getValue, format, f }
}
