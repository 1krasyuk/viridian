import { useCurrencyStore } from './store'

interface FormatOptions {
  notation?: 'standard' | 'compact'
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

export function useFormatCurrency() {
  const currency = useCurrencyStore((s) => s.currency)

  return function format(
    value: number | null | undefined,
    opts: FormatOptions = {},
  ): string {
    if (value == null || !isFinite(value)) return '—'

    const {
      notation = 'standard',
      maximumFractionDigits = 2,
      minimumFractionDigits = 2,
    } = opts

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
}

export function useCurrencyValue() {
  const currency = useCurrencyStore((s) => s.currency)

  return function getValue(
    record: Record<string, number> | null | undefined,
  ): number | null {
    if (!record) return null
    return record[currency] ?? record['usd'] ?? null
  }
}

export function useCurrency() {
  const getValue = useCurrencyValue()
  const format = useFormatCurrency()

  return {
    currency: useCurrencyStore((s) => s.currency),
    setCurrency: useCurrencyStore((s) => s.setCurrency),
    getValue,
    format,
    f: (
      record: Record<string, number> | null | undefined,
      opts?: FormatOptions,
    ) => format(getValue(record), opts),
  }
}
