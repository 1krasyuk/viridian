import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  useCurrencyStore,
  POPULAR_CURRENCIES,
  FIAT_CURRENCIES,
  CRYPTO_CURRENCIES,
  type CurrencyCode,
} from './store'
import { Check, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

const CURRENCY_NAMES: Record<string, string> = {
  // CRYPTO currencies
  btc: 'Bitcoin',
  eth: 'Ethereum',
  ltc: 'Litecoin',
  bch: 'Bitcoin Cash',
  bnb: 'Binance Coin',
  eos: 'EOS',
  xrp: 'XRP',
  xlm: 'Stellar',
  link: 'Chainlink',
  dot: 'Polkadot',
  yfi: 'Yearn Finance',
  sol: 'Solana',
  bits: 'Bits',
  sats: 'Satoshi',

  // FIAT currencies
  usd: 'United States Dollar',
  aed: 'UAE Dirham',
  ars: 'Argentine Peso',
  aud: 'Australian Dollar',
  bdt: 'Bangladeshi Taka',
  bhd: 'Bahraini Dinar',
  bmd: 'Bermudian Dollar',
  brl: 'Brazilian Real',
  cad: 'Canadian Dollar',
  chf: 'Swiss Franc',
  clp: 'Chilean Peso',
  cny: 'Chinese Yuan',
  czk: 'Czech Koruna',
  dkk: 'Danish Krone',
  eur: 'Euro',
  gbp: 'Pound Sterling',
  gel: 'Georgian Lari',
  hkd: 'Hong Kong Dollar',
  huf: 'Hungarian Forint',
  idr: 'Indonesian Rupiah',
  ils: 'Israeli Shekel',
  inr: 'Indian Rupee',
  jpy: 'Japanese Yen',
  krw: 'South Korean Won',
  kwd: 'Kuwaiti Dinar',
  lkr: 'Sri Lankan Rupee',
  mmk: 'Myanmar Kyat',
  mxn: 'Mexican Peso',
  myr: 'Malaysian Ringgit',
  ngn: 'Nigerian Naira',
  nok: 'Norwegian Krone',
  nzd: 'New Zealand Dollar',
  php: 'Philippine Peso',
  pkr: 'Pakistani Rupee',
  pln: 'Polish Zloty',
  rub: 'Russian Ruble',
  sar: 'Saudi Riyal',
  sek: 'Swedish Krona',
  sgd: 'Singapore Dollar',
  thb: 'Thai Baht',
  try: 'Turkish Lira',
  twd: 'New Taiwan Dollar',
  uah: 'Ukrainian Hryvnia',
  vef: 'Venezuelan Bolívar',
  vnd: 'Vietnamese Dong',
  zar: 'South African Rand',
  xdr: 'Special Drawing Rights',
  xag: 'Silver (Troy Ounce)',
  xau: 'Gold (Troy Ounce)',
}

function CurrencyGroup({
  title,
  codes,
  selected,
  onSelect,
  search,
}: {
  title: string
  codes: CurrencyCode[]
  selected: CurrencyCode
  onSelect: (code: CurrencyCode) => void
  search: string
}) {
  const filtered = useMemo(() => {
    const lower = search.toLowerCase()
    return codes.filter(
      (c) =>
        c.toLowerCase().includes(lower) ||
        (CURRENCY_NAMES[c]?.toLowerCase() ?? '').includes(lower),
    )
  }, [codes, search])

  if (filtered.length === 0) return null

  return (
    <div className='space-y-3'>
      <h3 className='text-base font-semibold text-muted-foreground capitalize tracking-wider px-2'>
        {title}
      </h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {filtered.map((code) => (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
              selected === code
                ? 'bg-primary/15 text-primary'
                : 'hover:bg-accent/50'
            }`}
          >
            <span className='font-mono text-sm font-semibold text-foreground'>
              {code.toUpperCase()}
            </span>
            <span className='text-xs truncate flex-1 text-muted-foreground'>
              {CURRENCY_NAMES[code] ?? code.toUpperCase()}
            </span>
            {selected === code && <Check className='size-4 shrink-0' />}
          </button>
        ))}
      </div>
    </div>
  )
}

interface CurrencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CurrencyModal({ open, onOpenChange }: CurrencyModalProps) {
  const { currency, setCurrency } = useCurrencyStore()
  const [search, setSearch] = useState('')

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-sidebar grid-rows-[auto_auto_1fr] max-h-screen md:max-h-[60vh] max-w-none sm:max-w-3xl gap-4 overflow-hidden rounded-none md:rounded-3xl p-4 sm:rounded-4xl sm:p-6'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl'>Currency</DialogTitle>
        </DialogHeader>

        <div className='relative shrink-0'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-0'
          />
        </div>

        <div className='min-h-0 overflow-y-auto overscroll-contain no-scrollbar space-y-4'>
          {!search && (
            <CurrencyGroup
              title='Popular currencies'
              codes={POPULAR_CURRENCIES}
              selected={currency}
              onSelect={handleSelect}
              search={search}
            />
          )}
          <CurrencyGroup
            title='Fiat currencies'
            codes={FIAT_CURRENCIES}
            selected={currency}
            onSelect={handleSelect}
            search={search}
          />
          <CurrencyGroup
            title='Crypto currencies'
            codes={CRYPTO_CURRENCIES}
            selected={currency}
            onSelect={handleSelect}
            search={search}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
