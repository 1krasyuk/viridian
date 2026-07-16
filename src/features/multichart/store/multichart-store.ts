import { create } from 'zustand'

import type { CoinChartDataType } from '@/features/market/components/coin-page/coin-chart/types'
import type { CoinsList } from '@/features/market/types/coins-list'
import {
  CHARTS_SESSION_KEY,
  MAX_CHARTS,
  MULTICHARTS_STORAGE_KEY,
} from '../types/constants'
import type { ChartItem, Multichart } from '../types/types'

type ChartPatch = Partial<Pick<ChartItem, 'days' | 'dataType'>>

type MultichartState = {
  multicharts: Multichart[]
  activeId: string
  columns: number
  gap: number
  heightPercent: number
  globalDays: string
  globalDataType: CoinChartDataType
  pickerOpen: boolean
  sidebarOpen: boolean
  createOpen: boolean
  renameOpen: boolean
  newName: string
  renameName: string
  setActiveId: (id: string) => void
  setColumns: (columns: number) => void
  setGap: (gap: number) => void
  setHeightPercent: (height: number) => void
  setPickerOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setCreateOpen: (open: boolean) => void
  setRenameOpen: (open: boolean) => void
  setNewName: (name: string) => void
  setRenameName: (name: string) => void
  openPicker: () => void
  toggleSidebar: () => void
  openCreateDialog: () => void
  openRenameDialog: () => void
  addCoins: (coins: CoinsList[]) => void
  addCoin: (coin: CoinsList) => void
  setDays: (days: string) => void
  setDataType: (dataType: CoinChartDataType) => void
  createMultichart: () => void
  renameMultichart: () => void
  makeDefault: () => void
  clearCharts: () => void
  deleteMultichart: () => void
  updateChart: (id: string, patch: ChartPatch) => void
  removeChart: (id: string) => void
  resetPage: () => void
}

const defaultMultichart = (): Multichart => ({
  id: 'default',
  name: 'My Multichart',
  isDefault: true,
  charts: [],
})

function loadMulticharts() {
  if (typeof window === 'undefined') return [defaultMultichart()]

  try {
    const saved = JSON.parse(
      localStorage.getItem(MULTICHARTS_STORAGE_KEY) ?? '[]',
    ) as Pick<Multichart, 'id' | 'name' | 'isDefault'>[]
    const charts = JSON.parse(
      sessionStorage.getItem(CHARTS_SESSION_KEY) ?? '{}',
    ) as Record<string, ChartItem[]>

    if (saved.length) {
      return saved.map((item) => ({
        ...item,
        charts: charts[item.id] ?? [],
      }))
    }
  } catch {
    // Invalid saved data falls back to a clean workspace.
  }

  return [defaultMultichart()]
}

function getInitialState() {
  const multicharts = loadMulticharts()
  const defaultId = multicharts.find((item) => item.isDefault)?.id
  const savedActiveId =
    typeof window === 'undefined'
      ? null
      : localStorage.getItem(`${MULTICHARTS_STORAGE_KEY}-active`)
  const activeId =
    defaultId ??
    multicharts.find((item) => item.id === savedActiveId)?.id ??
    multicharts[0].id

  return { multicharts, activeId }
}

const initialState = getInitialState()

const activeMultichart = (state: MultichartState) =>
  state.multicharts.find((item) => item.id === state.activeId) ??
  state.multicharts[0]

const updateActiveCharts = (
  state: MultichartState,
  updater: (charts: ChartItem[]) => ChartItem[],
) => {
  const active = activeMultichart(state)
  return state.multicharts.map((item) =>
    item.id === active.id ? { ...item, charts: updater(item.charts) } : item,
  )
}

export const useMultichartStore = create<MultichartState>()((set, get) => ({
  ...initialState,
  columns: 2,
  gap: 1,
  heightPercent: 100,
  globalDays: '7',
  globalDataType: 'price',
  pickerOpen: false,
  sidebarOpen: false,
  createOpen: false,
  renameOpen: false,
  newName: '',
  renameName: '',
  setActiveId: (activeId) => set({ activeId }),
  setColumns: (columns) => set({ columns }),
  setGap: (gap) => set({ gap }),
  setHeightPercent: (heightPercent) => set({ heightPercent }),
  setPickerOpen: (pickerOpen) => set({ pickerOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCreateOpen: (createOpen) => set({ createOpen }),
  setRenameOpen: (renameOpen) => set({ renameOpen }),
  setNewName: (newName) => set({ newName }),
  setRenameName: (renameName) => set({ renameName }),
  openPicker: () => set({ pickerOpen: true }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openCreateDialog: () => set({ createOpen: true }),
  openRenameDialog: () => {
    const active = activeMultichart(get())
    set({ renameName: active.name, renameOpen: true })
  },
  addCoins: (coins) => {
    const state = get()
    const charts = activeMultichart(state).charts
    const selectedIds = new Set(charts.map((item) => item.coin.id))
    const available = coins
      .filter((coin) => !selectedIds.has(coin.id))
      .slice(0, MAX_CHARTS - charts.length)

    set({
      multicharts: updateActiveCharts(state, (items) => [
        ...items,
        ...available.map((coin) => ({
          id: crypto.randomUUID(),
          coin,
          days: state.globalDays,
          dataType: state.globalDataType,
        })),
      ]),
      pickerOpen: false,
    })
  },
  addCoin: (coin) => {
    const state = get()
    const charts = activeMultichart(state).charts
    if (
      charts.length >= MAX_CHARTS ||
      charts.some((item) => item.coin.id === coin.id)
    )
      return

    set({
      multicharts: updateActiveCharts(state, (items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          coin,
          days: state.globalDays,
          dataType: state.globalDataType,
        },
      ]),
    })
  },
  setDays: (globalDays) =>
    set((state) => ({
      globalDays,
      multicharts: updateActiveCharts(state, (items) =>
        items.map((item) => ({ ...item, days: globalDays })),
      ),
    })),
  setDataType: (globalDataType) =>
    set((state) => ({
      globalDataType,
      multicharts: updateActiveCharts(state, (items) =>
        items.map((item) => ({ ...item, dataType: globalDataType })),
      ),
    })),
  createMultichart: () => {
    const state = get()
    const name = state.newName.trim()
    if (!name) return
    const id = crypto.randomUUID()
    set({
      multicharts: [...state.multicharts, { id, name, charts: [] }],
      activeId: id,
      newName: '',
      createOpen: false,
    })
  },
  renameMultichart: () => {
    const state = get()
    const name = state.renameName.trim()
    if (!name) return
    const active = activeMultichart(state)
    set({
      multicharts: state.multicharts.map((item) =>
        item.id === active.id ? { ...item, name } : item,
      ),
      renameOpen: false,
    })
  },
  makeDefault: () => {
    const state = get()
    const active = activeMultichart(state)
    const updated = state.multicharts.map((item) => ({
      ...item,
      isDefault: item.id === active.id,
    }))
    set({
      multicharts: [
        updated.find((item) => item.id === active.id)!,
        ...updated.filter((item) => item.id !== active.id),
      ],
    })
  },
  clearCharts: () =>
    set((state) => ({
      multicharts: updateActiveCharts(state, () => []),
    })),
  deleteMultichart: () => {
    const state = get()
    if (state.multicharts.length === 1) return
    const active = activeMultichart(state)
    const remaining = state.multicharts.filter((item) => item.id !== active.id)
    set({
      multicharts: remaining,
      activeId:
        remaining.find((item) => item.isDefault)?.id ?? remaining[0].id,
    })
  },
  updateChart: (id, patch) =>
    set((state) => ({
      multicharts: updateActiveCharts(state, (items) =>
        items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      ),
    })),
  removeChart: (id) =>
    set((state) => ({
      multicharts: updateActiveCharts(state, (items) =>
        items.filter((item) => item.id !== id),
      ),
    })),
  resetPage: () =>
    set({
      multicharts: [defaultMultichart()],
      activeId: 'default',
      columns: 2,
      gap: 1,
      heightPercent: 100,
      globalDays: '7',
      globalDataType: 'price',
      pickerOpen: false,
      sidebarOpen: false,
      createOpen: false,
      renameOpen: false,
      newName: '',
      renameName: '',
    }),
}))

if (typeof window !== 'undefined') {
  let savedMulticharts = ''
  let savedCharts = ''
  let savedActiveId = ''

  useMultichartStore.subscribe((state) => {
    const multicharts = JSON.stringify(
      state.multicharts.map(({ id, name, isDefault }) => ({
        id,
        name,
        isDefault,
      })),
    )
    const charts = JSON.stringify(
      Object.fromEntries(
        state.multicharts.map(({ id, charts: items }) => [id, items]),
      ),
    )

    if (multicharts !== savedMulticharts) {
      localStorage.setItem(MULTICHARTS_STORAGE_KEY, multicharts)
      savedMulticharts = multicharts
    }
    if (charts !== savedCharts) {
      sessionStorage.setItem(CHARTS_SESSION_KEY, charts)
      savedCharts = charts
    }
    if (state.activeId !== savedActiveId) {
      localStorage.setItem(
        `${MULTICHARTS_STORAGE_KEY}-active`,
        state.activeId,
      )
      savedActiveId = state.activeId
    }
  })
}
