import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Bookmark,
  Ellipsis,
  Minus,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'

import { useCurrency } from '@/features/currency/hooks'
import { useCoins } from '@/features/market/hooks/coins-queries'
import type { CoinsList } from '@/features/market/types/coins-list'
import type { CoinChartDataType } from '@/features/market/components/coin-page/coin-chart/types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { cn } from '@/shared/lib/utils'
import {
  MAX_CHARTS,
  MAX_COLUMNS,
  MULTICHARTS_STORAGE_KEY,
  CHARTS_SESSION_KEY,
  GAP_STEPS,
  HEIGHT_STEPS,
  PERIODS,
} from '../types/constants'
import type { ChartItem, Multichart, SortBy } from '../types/types'
import { MultichartTabs } from './multichart-tabs'
import { MultichartGrid } from './multichart-grid'

function stepValue<T>(values: T[], current: T, direction: -1 | 1) {
  const index = values.indexOf(current)
  return values[Math.max(0, Math.min(values.length - 1, index + direction))]
}

function Change({ value }: { value: number | null }) {
  if (value == null) return <span className='text-muted-foreground'>—</span>
  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        value >= 0 ? 'text-emerald-500' : 'text-red-500',
      )}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

function Sparkline({ coin }: { coin: CoinsList }) {
  const prices = coin.sparkline_in_7d?.price?.filter(Number.isFinite) ?? []
  if (prices.length < 2) return <div className='h-9' />
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const points = prices
    .map(
      (price, index) =>
        `${(index / (prices.length - 1)) * 100},${44 - ((price - min) / range) * 40}`,
    )
    .join(' ')
  const path = `M ${points.replaceAll(' ', ' L ')}`
  const area = `${path} L 100,48 L 0,48 Z`
  const gradientId = `coin-sparkline-${coin.id}`
  const positive = prices.at(-1)! >= prices[0]
  return (
    <svg
      viewBox='0 0 100 48'
      preserveAspectRatio='none'
      className={cn(
        'h-9 w-full',
        positive ? 'text-emerald-500' : 'text-red-500',
      )}
      aria-hidden='true'
    >
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.3' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.02' />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function Counter({
  label,
  value,
  mobileLocked = false,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: {
  label: string
  value: string | number
  mobileLocked?: boolean
  onDecrease: () => void
  onIncrease: () => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
}) {
  return (
    <div className='flex h-8 min-w-0 items-center rounded-md border bg-secondary/55 px-1 lg:h-9 lg:pl-3 lg:pr-1'>
      <span className='min-w-0 whitespace-nowrap text-xs text-muted-foreground lg:text-xs'>
        {label}
      </span>
      <div className='ml-auto flex shrink-0 items-center'>
        <Button
          variant='ghost'
          size='icon-sm'
          className='size-4.5 p-0 lg:size-8 [&_svg]:size-3 lg:[&_svg]:size-4'
          onClick={onDecrease}
          disabled={decreaseDisabled || mobileLocked}
          aria-label={`Decrease ${label}`}
        >
          <Minus />
        </Button>
        <span className='min-w-4 text-center text-xs font-semibold tabular-nums lg:min-w-7 lg:text-sm'>
          {mobileLocked ? 1 : value}
        </span>
        <Button
          variant='ghost'
          size='icon-sm'
          className='size-4.5 p-0 lg:size-8 [&_svg]:size-3 lg:[&_svg]:size-4'
          onClick={onIncrease}
          disabled={increaseDisabled || mobileLocked}
          aria-label={`Increase ${label}`}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}

function CoinPicker({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  onSelect: (coins: CoinsList[]) => void
}) {
  const { currency, format } = useCurrency()
  const {
    data = [],
    isLoading,
    isError,
  } = useCoins(1, 250, undefined, currency, open, Infinity, false, Infinity)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rank')
  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set())

  const coins = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = data.filter(
      (coin) =>
        !normalized ||
        coin.name.toLowerCase().includes(normalized) ||
        coin.symbol.toLowerCase().includes(normalized),
    )
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rank')
        return (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity)
      const key =
        sortBy === 'price'
          ? 'current_price'
          : sortBy === 'market_cap'
            ? 'market_cap'
            : 'total_volume'
      return (b[key] ?? 0) - (a[key] ?? 0)
    })
  }, [data, query, sortBy])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setSelectedCoins(new Set())
      }}
    >
      <DialogContent className='flex h-[min(46rem,calc(100dvh-2rem))] bg-card flex-col gap-3 rounded-xl p-0 sm:max-w-5xl!'>
        <DialogHeader className='px-5 pt-5'>
          <DialogTitle>Add coins</DialogTitle>
          <DialogDescription>
            Choose several coins from the top 250 and add them together.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-2 px-5 sm:grid-cols-[1fr_11rem]'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search coins…'
              className='rounded-md pl-9'
              autoFocus
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <SelectTrigger className='w-full rounded-md'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='rank'>Sort by rank</SelectItem>
              <SelectItem value='price'>Sort by price</SelectItem>
              <SelectItem value='market_cap'>Sort by market cap</SelectItem>
              <SelectItem value='volume'>Sort by volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className='min-h-0 flex-1 border-y'>
          <div className='grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-3'>
            {isLoading &&
              Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className='h-44 rounded-xl' />
              ))}
            {isError && (
              <p className='col-span-full flex min-h-80 items-center justify-center text-center text-sm text-destructive'>
                Could not load coins.
              </p>
            )}
            {!isLoading && !isError && coins.length === 0 && (
              <p className='col-span-full flex min-h-80 items-center justify-center text-center text-sm text-muted-foreground'>
                No coins found.
              </p>
            )}
            {coins.map((coin) => {
              const alreadyAdded = selectedIds.has(coin.id)
              const selected = selectedCoins.has(coin.id)
              const liquidity = coin.market_cap
                ? ((coin.total_volume ?? 0) / coin.market_cap) * 100
                : null
              return (
                <button
                  key={coin.id}
                  type='button'
                  disabled={alreadyAdded}
                  onClick={() =>
                    setSelectedCoins((current) => {
                      const next = new Set(current)
                      if (next.has(coin.id)) next.delete(coin.id)
                      else if (next.size < MAX_CHARTS - selectedIds.size)
                        next.add(coin.id)
                      return next
                    })
                  }
                  className={cn(
                    'rounded-xl border bg-linear-to-br from-card to-background p-3 text-left transition-all hover:border-primary/45 disabled:opacity-45',
                    selected &&
                      'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <img
                        src={coin.image}
                        alt=''
                        className='size-8 rounded-full'
                        loading='lazy'
                      />
                      <span className='truncate font-medium text-base'>
                        {coin.name}
                      </span>
                      <Badge variant='secondary' className='uppercase'>
                        {coin.symbol}
                      </Badge>
                    </div>
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary',
                        selected && 'bg-primary text-primary-foreground',
                        alreadyAdded && 'bg-emerald-500/15 text-emerald-500',
                      )}
                    >
                      {selected || alreadyAdded ? (
                        <Check className='size-4' />
                      ) : (
                        <Plus className='size-4' />
                      )}
                    </span>
                  </div>
                  <div className='mt-2.5 flex items-baseline gap-2'>
                    <span className='text-lg font-bold tabular-nums'>
                      {format(coin.current_price, { maximumFractionDigits: 6 })}
                    </span>
                    <Change value={coin.price_change_percentage_24h} />
                  </div>
                  <div className='my-2'>
                    <Sparkline coin={coin} />
                  </div>
                  <div className='grid grid-cols-[auto_auto] justify-between gap-x-4 gap-y-1.5 text-xs'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <div className='text-muted-foreground'>Market cap</div>
                      <div className='truncate text-right font-medium'>
                        {format(coin.market_cap, { notation: 'compact' })}
                      </div>
                    </div>
                    <div className='flex min-w-0 items-center gap-2'>
                      <div className='text-muted-foreground'>Volume 24H</div>
                      <div className='truncate text-right font-medium'>
                        {format(coin.total_volume, { notation: 'compact' })}
                      </div>
                    </div>
                    <div className='flex min-w-0 items-center gap-2'>
                      <div className='text-muted-foreground'>Liquidity</div>
                      <div className='text-right font-medium'>
                        {liquidity == null ? '—' : `${liquidity.toFixed(2)}%`}
                      </div>
                    </div>
                    <div className='flex min-w-0 items-center gap-2'>
                      <div className='text-muted-foreground'>Change 24H</div>
                      <div className='text-right'>
                        <Change value={coin.price_change_percentage_24h} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
        <DialogFooter className='px-5 pb-5 sm:justify-between!'>
          <DialogClose asChild>
            <Button variant='destructive'>Cancel</Button>
          </DialogClose>
          <Button
            variant='soft'
            disabled={selectedCoins.size === 0}
            onClick={() => {
              const chosen = data.filter((coin) => selectedCoins.has(coin.id))
              onSelect(chosen)
              setSelectedCoins(new Set())
            }}
          >
            <Check /> Confirm
            {selectedCoins.size ? ` (${selectedCoins.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CoinSidebar({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  onSelect: (coin: CoinsList) => void
}) {
  const { currency, format } = useCurrency()
  const { data = [], isLoading } = useCoins(
    1,
    250,
    undefined,
    currency,
    open,
    Infinity,
    false,
    Infinity,
  )
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rank')
  const coins = useMemo(() => {
    const value = query.trim().toLowerCase()
    return data
      .filter(
        (coin) =>
          !value ||
          coin.name.toLowerCase().includes(value) ||
          coin.symbol.toLowerCase().includes(value),
      )
      .sort((a, b) => {
        if (sortBy === 'rank')
          return (
            (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity)
          )
        const key =
          sortBy === 'price'
            ? 'current_price'
            : sortBy === 'market_cap'
              ? 'market_cap'
              : 'total_volume'
        return (b[key] ?? 0) - (a[key] ?? 0)
      })
  }, [data, query, sortBy])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        showOverlay={false}
        className='w-85! gap-0 p-0 sm:max-w-xs'
      >
        <SheetHeader className='px-4 pb-4 pt-5'>
          <SheetTitle>Coin screener</SheetTitle>
          <SheetDescription>
            Click a coin to add it immediately.
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-2 px-4 pb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search top 250…'
              className='rounded-md pl-9'
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <SelectTrigger className='w-full rounded-md'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='rank'>Sort by rank</SelectItem>
              <SelectItem value='price'>Sort by price</SelectItem>
              <SelectItem value='market_cap'>Sort by market cap</SelectItem>
              <SelectItem value='volume'>Sort by volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className='min-h-0 flex-1 border-t'>
          <div className='divide-y'>
            {isLoading &&
              Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className='mx-5 my-3 h-14' />
              ))}
            {coins.map((coin) => {
              const added = selectedIds.has(coin.id)
              return (
                <button
                  key={coin.id}
                  type='button'
                  disabled={added}
                  onClick={() => onSelect(coin)}
                  className='grid w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-3 overflow-hidden px-4 py-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-40'
                >
                  <img
                    src={coin.image}
                    alt=''
                    className='size-9 rounded-full'
                    loading='lazy'
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex min-w-0 items-center gap-2 overflow-hidden'>
                      <span className='truncate font-medium' title={coin.name}>
                        {coin.name}
                      </span>
                      <Badge variant='secondary' className='uppercase'>
                        {coin.symbol}
                      </Badge>
                    </div>
                    <div className='mt-1 flex gap-3 text-xs'>
                      <span>
                        1H{' '}
                        <Change
                          value={coin.price_change_percentage_1h_in_currency}
                        />
                      </span>
                      <span>
                        24H <Change value={coin.price_change_percentage_24h} />
                      </span>
                    </div>
                  </div>
                  <div className='min-w-0 overflow-hidden text-right text-xs'>
                    <div className='truncate font-semibold'>
                      {format(coin.current_price, { maximumFractionDigits: 6 })}
                    </div>
                    <div className='truncate text-muted-foreground'>
                      {format(coin.market_cap, { notation: 'compact' })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export function MultichartPage() {
  const [isCompact, setIsCompact] = useState(
    () => window.matchMedia('(max-width: 1023px)').matches,
  )
  const [multicharts, setMulticharts] = useState<Multichart[]>(() => {
    try {
      const savedMulticharts = JSON.parse(
        localStorage.getItem(MULTICHARTS_STORAGE_KEY) ?? '[]',
      ) as Pick<Multichart, 'id' | 'name' | 'isDefault'>[]
      const savedCharts = JSON.parse(
        sessionStorage.getItem(CHARTS_SESSION_KEY) ?? '{}',
      ) as Record<string, ChartItem[]>
      if (savedMulticharts.length)
        return savedMulticharts.map((item) => ({
          ...item,
          charts: savedCharts[item.id] ?? [],
        }))
    } catch {
      // Fall back to a clean workspace when saved data is invalid.
    }
    return [
      { id: 'default', name: 'My Multichart', isDefault: true, charts: [] },
    ]
  })
  const [activeId, setActiveId] = useState(() => {
    const savedActive = localStorage.getItem(
      `${MULTICHARTS_STORAGE_KEY}-active`,
    )
    try {
      const saved = JSON.parse(
        localStorage.getItem(MULTICHARTS_STORAGE_KEY) ?? '[]',
      ) as Pick<Multichart, 'id' | 'isDefault'>[]
      const defaultId = saved.find((item) => item.isDefault)?.id
      if (defaultId) return defaultId
      if (savedActive && saved.some((item) => item.id === savedActive))
        return savedActive
      return saved[0]?.id ?? 'default'
    } catch {
      return 'default'
    }
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [renameName, setRenameName] = useState('')
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState(1)
  const [heightPercent, setHeightPercent] = useState(100)
  const [globalDays, setGlobalDays] = useState('7')
  const [globalDataType, setGlobalDataType] =
    useState<CoinChartDataType>('price')
  const active =
    multicharts.find((item) => item.id === activeId) ?? multicharts[0]
  const charts = active.charts

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsCompact(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      MULTICHARTS_STORAGE_KEY,
      JSON.stringify(
        multicharts.map(({ id, name, isDefault }) => ({ id, name, isDefault })),
      ),
    )
    sessionStorage.setItem(
      CHARTS_SESSION_KEY,
      JSON.stringify(
        Object.fromEntries(
          multicharts.map(({ id, charts: items }) => [id, items]),
        ),
      ),
    )
  }, [multicharts])

  useEffect(() => {
    localStorage.setItem(`${MULTICHARTS_STORAGE_KEY}-active`, activeId)
  }, [activeId])

  const updateActiveCharts = (
    updater: (charts: ChartItem[]) => ChartItem[],
  ) => {
    setMulticharts((items) =>
      items.map((item) =>
        item.id === active.id
          ? { ...item, charts: updater(item.charts) }
          : item,
      ),
    )
  }

  const createMultichart = () => {
    const name = newName.trim()
    if (!name) return
    const id = crypto.randomUUID()
    setMulticharts((items) => [...items, { id, name, charts: [] }])
    setActiveId(id)
    setNewName('')
    setCreateOpen(false)
  }

  const addCoins = (coins: CoinsList[]) => {
    const available = coins
      .filter((coin) => !charts.some((item) => item.coin.id === coin.id))
      .slice(0, MAX_CHARTS - charts.length)
    if (!available.length) return
    updateActiveCharts((items) => [
      ...items,
      ...available.map((coin) => ({
        id: crypto.randomUUID(),
        coin,
        days: globalDays,
        dataType: globalDataType,
      })),
    ])
    setPickerOpen(false)
  }

  const addCoinFromSidebar = (coin: CoinsList) => {
    if (
      charts.length >= MAX_CHARTS ||
      charts.some((item) => item.coin.id === coin.id)
    )
      return
    updateActiveCharts((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        coin,
        days: globalDays,
        dataType: globalDataType,
      },
    ])
  }

  const setAllDays = (days: string) => {
    setGlobalDays(days)
    updateActiveCharts((items) => items.map((item) => ({ ...item, days })))
  }

  const setAllDataType = (dataType: CoinChartDataType) => {
    setGlobalDataType(dataType)
    updateActiveCharts((items) => items.map((item) => ({ ...item, dataType })))
  }

  const renameMultichart = () => {
    const name = renameName.trim()
    if (!name) return
    setMulticharts((items) =>
      items.map((item) => (item.id === active.id ? { ...item, name } : item)),
    )
    setRenameOpen(false)
  }

  const setDefaultMultichart = () => {
    setMulticharts((items) => {
      const reordered = items.map((item) => ({
        ...item,
        isDefault: item.id === active.id,
      }))
      const selected = reordered.find((item) => item.id === active.id)!
      return [selected, ...reordered.filter((item) => item.id !== active.id)]
    })
  }

  const deleteMultichart = () => {
    if (multicharts.length === 1) return
    const remaining = multicharts.filter((item) => item.id !== active.id)
    setMulticharts(remaining)
    setActiveId(remaining.find((item) => item.isDefault)?.id ?? remaining[0].id)
  }

  const resetMultichartPage = () => {
    setMulticharts([
      { id: 'default', name: 'My Multichart', isDefault: true, charts: [] },
    ])
    setActiveId('default')
    setColumns(2)
    setGap(1)
    setHeightPercent(100)
    setGlobalDays('7')
    setGlobalDataType('price')
    setSidebarOpen(false)
    setPickerOpen(false)
  }

  const chartHeight = Math.round(200 + 2.8 * heightPercent)

  return (
    <div className='min-h-[calc(100dvh-3.5rem)] bg-muted/20 md:min-h-dvh'>
      <MultichartTabs
        multicharts={multicharts}
        activeId={activeId}
        onActiveChange={setActiveId}
        onCreate={() => setCreateOpen(true)}
        onReset={resetMultichartPage}
      />

      <div className='sticky top-14 z-20 grid grid-cols-2 gap-2 border-b bg-background px-3 py-3 md:top-0 lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:px-5'>
        <Select value={globalDays} onValueChange={setAllDays}>
          <SelectTrigger className='w-full rounded-md bg-secondary/55 lg:w-34'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={globalDataType}
          onValueChange={(value) => setAllDataType(value as CoinChartDataType)}
        >
          <SelectTrigger className='w-full rounded-md bg-secondary/55 lg:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='price'>Price</SelectItem>
            <SelectItem value='marketCap'>Market cap</SelectItem>
          </SelectContent>
        </Select>
        <div className='col-span-2 grid grid-cols-3 gap-1 lg:contents'>
          <Counter
            mobileLocked={isCompact}
            label='Columns'
            value={columns}
            onDecrease={() => setColumns((v) => Math.max(1, v - 1))}
            onIncrease={() => setColumns((v) => Math.min(MAX_COLUMNS, v + 1))}
            decreaseDisabled={columns === 1}
            increaseDisabled={columns === MAX_COLUMNS}
          />
          <Counter
            label='Gap'
            value={gap}
            onDecrease={() => setGap(stepValue(GAP_STEPS, gap, -1))}
            onIncrease={() => setGap(stepValue(GAP_STEPS, gap, 1))}
            decreaseDisabled={gap === GAP_STEPS[0]}
            increaseDisabled={gap === GAP_STEPS.at(-1)}
          />
          <Counter
            label='Height'
            value={`${heightPercent}%`}
            onDecrease={() =>
              setHeightPercent(stepValue(HEIGHT_STEPS, heightPercent, -1))
            }
            onIncrease={() =>
              setHeightPercent(stepValue(HEIGHT_STEPS, heightPercent, 1))
            }
            decreaseDisabled={heightPercent === 25}
            increaseDisabled={heightPercent === 150}
          />
        </div>
        <div className='col-span-2 flex w-full gap-2 lg:ml-auto lg:w-auto lg:flex-wrap lg:justify-end'>
          <Button
            variant='secondary'
            onClick={() => setPickerOpen(true)}
            disabled={charts.length >= MAX_CHARTS}
            className='min-w-0 flex-1 lg:flex-none'
          >
            <Search /> Search coins
          </Button>
          <Button
            variant='secondary'
            onClick={() => setSidebarOpen((open) => !open)}
            disabled={!sidebarOpen && charts.length >= MAX_CHARTS}
            className='hidden lg:inline-flex'
          >
            <SlidersHorizontal /> Coin screener
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='secondary'
                size='icon'
                aria-label='Multichart options'
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' side='bottom' className='w-64'>
              <DropdownMenuItem
                onSelect={() => {
                  setRenameName(active.name)
                  setRenameOpen(true)
                }}
              >
                <Pencil /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={setDefaultMultichart}
                className='whitespace-nowrap'
              >
                <Bookmark
                  className={cn(
                    active.isDefault && 'fill-current text-foreground',
                  )}
                />
                Make default multichart
                {active.isDefault && (
                  <Check className='ml-auto shrink-0 text-foreground' />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onSelect={() => updateActiveCharts(() => [])}
                disabled={charts.length === 0}
              >
                <RefreshCcw /> Clear multichart
              </DropdownMenuItem>
              <DropdownMenuItem
                variant='destructive'
                onSelect={deleteMultichart}
                disabled={multicharts.length === 1}
              >
                <Trash2 /> Delete multichart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='min-w-0'>
        <main className='w-full min-w-0 flex-1 p-3 lg:p-5'>
          <MultichartGrid
            charts={charts}
            columns={isCompact ? 1 : columns}
            gap={gap}
            height={chartHeight}
            onAdd={() => setPickerOpen(true)}
            onChange={(id, patch) =>
              updateActiveCharts((items) =>
                items.map((chart) =>
                  chart.id === id ? { ...chart, ...patch } : chart,
                ),
              )
            }
            onRemove={(id) =>
              updateActiveCharts((items) =>
                items.filter((chart) => chart.id !== id),
              )
            }
          />
        </main>
        <CoinSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          selectedIds={new Set(charts.map((item) => item.coin.id))}
          onSelect={addCoinFromSidebar}
        />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='rounded-xl bg-card'>
          <DialogHeader>
            <DialogTitle>Create multichart</DialogTitle>
            <DialogDescription>
              Give this chart workspace a name.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && createMultichart()}
            placeholder='Multichart name'
            className='rounded-md'
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={createMultichart} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className='rounded-xl'>
          <DialogHeader>
            <DialogTitle>Rename multichart</DialogTitle>
            <DialogDescription>
              Choose a new name for this workspace.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(event) => setRenameName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && renameMultichart()}
            placeholder='Multichart name'
            className='rounded-md'
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={renameMultichart} disabled={!renameName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoinPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={new Set(charts.map((item) => item.coin.id))}
        onSelect={addCoins}
      />
    </div>
  )
}
