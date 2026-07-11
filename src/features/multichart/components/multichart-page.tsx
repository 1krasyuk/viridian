import { useEffect, useState } from 'react'

import type { CoinChartDataType } from '@/features/market/components/coin-page/coin-chart/types'
import type { CoinsList } from '@/features/market/types/coins-list'
import {
  MAX_CHARTS,
  MULTICHARTS_STORAGE_KEY,
  CHARTS_SESSION_KEY,
} from '../types/constants'
import type { ChartItem, Multichart } from '../types/types'
import { MultichartTabs } from './tabs/multichart-tabs'
import { MultichartGrid } from './charts/multichart-grid'
import { CoinPicker } from './coins/multichart-coin-dialog'
import { CoinScreenerSheet } from './coins/multichart-coin-screener-sheet'
import { MultichartToolbar } from './toolbar/multichart-toolbar'
import { CreateMultichartDialog } from './dialog/multichart-dialog-create'
import { RenameMultichartDialog } from './dialog/multichart-dialog-rename'

export function MultichartPage() {
  const [isCompact, setIsCompact] = useState(
    () => window.matchMedia('(max-width: 1023px)').matches,
  )
  const [multicharts, setMulticharts] = useState<Multichart[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MULTICHARTS_STORAGE_KEY) ?? '[]',
      ) as Pick<Multichart, 'id' | 'name' | 'isDefault'>[]
      const charts = JSON.parse(
        sessionStorage.getItem(CHARTS_SESSION_KEY) ?? '{}',
      ) as Record<string, ChartItem[]>
      if (saved.length)
        return saved.map((item) => ({ ...item, charts: charts[item.id] ?? [] }))
    } catch {
      /* use defaults */
    }
    return [
      { id: 'default', name: 'My Multichart', isDefault: true, charts: [] },
    ]
  })
  const [activeId, setActiveId] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MULTICHARTS_STORAGE_KEY) ?? '[]',
      ) as Pick<Multichart, 'id' | 'isDefault'>[]
      return (
        saved.find((item) => item.isDefault)?.id ?? saved[0]?.id ?? 'default'
      )
    } catch {
      return 'default'
    }
  })
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState(1)
  const [heightPercent, setHeightPercent] = useState(100)
  const [globalDays, setGlobalDays] = useState('7')
  const [globalDataType, setGlobalDataType] =
    useState<CoinChartDataType>('price')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [renameName, setRenameName] = useState('')
  const active =
    multicharts.find((item) => item.id === activeId) ?? multicharts[0]
  const charts = active.charts
  const selectedIds = new Set(charts.map((item) => item.coin.id))

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
  useEffect(
    () => localStorage.setItem(`${MULTICHARTS_STORAGE_KEY}-active`, activeId),
    [activeId],
  )

  const updateCharts = (updater: (items: ChartItem[]) => ChartItem[]) => {
    setMulticharts((items) =>
      items.map((item) =>
        item.id === active.id
          ? { ...item, charts: updater(item.charts) }
          : item,
      ),
    )
  }
  const addCoins = (coins: CoinsList[]) => {
    const available = coins
      .filter((coin) => !selectedIds.has(coin.id))
      .slice(0, MAX_CHARTS - charts.length)
    updateCharts((items) => [
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
  const addCoin = (coin: CoinsList) => {
    if (charts.length >= MAX_CHARTS || selectedIds.has(coin.id)) return
    updateCharts((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        coin,
        days: globalDays,
        dataType: globalDataType,
      },
    ])
  }
  const setDays = (days: string) => {
    setGlobalDays(days)
    updateCharts((items) => items.map((item) => ({ ...item, days })))
  }
  const setDataType = (dataType: CoinChartDataType) => {
    setGlobalDataType(dataType)
    updateCharts((items) => items.map((item) => ({ ...item, dataType })))
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
  const renameMultichart = () => {
    const name = renameName.trim()
    if (!name) return
    setMulticharts((items) =>
      items.map((item) => (item.id === active.id ? { ...item, name } : item)),
    )
    setRenameOpen(false)
  }
  const makeDefault = () =>
    setMulticharts((items) => {
      const updated = items.map((item) => ({
        ...item,
        isDefault: item.id === active.id,
      }))
      return [
        updated.find((item) => item.id === active.id)!,
        ...updated.filter((item) => item.id !== active.id),
      ]
    })
  const deleteMultichart = () => {
    if (multicharts.length === 1) return
    const remaining = multicharts.filter((item) => item.id !== active.id)
    setMulticharts(remaining)
    setActiveId(remaining.find((item) => item.isDefault)?.id ?? remaining[0].id)
  }
  const resetPage = () => {
    setMulticharts([
      { id: 'default', name: 'My Multichart', isDefault: true, charts: [] },
    ])
    setActiveId('default')
    setColumns(2)
    setGap(1)
    setHeightPercent(100)
    setGlobalDays('7')
    setGlobalDataType('price')
    setPickerOpen(false)
    setSidebarOpen(false)
  }

  return (
    <div className='min-h-[calc(100dvh-3.5rem)] bg-muted/20 md:min-h-dvh'>
      <MultichartTabs
        multicharts={multicharts}
        activeId={activeId}
        onActiveChange={setActiveId}
        onCreate={() => setCreateOpen(true)}
        onReset={resetPage}
      />
      <MultichartToolbar
        active={active}
        chartCount={charts.length}
        columns={columns}
        gap={gap}
        heightPercent={heightPercent}
        globalDays={globalDays}
        globalDataType={globalDataType}
        compact={isCompact}
        sidebarOpen={sidebarOpen}
        onDaysChange={setDays}
        onDataTypeChange={setDataType}
        onColumnsChange={setColumns}
        onGapChange={setGap}
        onHeightChange={setHeightPercent}
        onSearch={() => setPickerOpen(true)}
        onToggleScreener={() => setSidebarOpen((value) => !value)}
        onRename={() => {
          setRenameName(active.name)
          setRenameOpen(true)
        }}
        onMakeDefault={makeDefault}
        onClear={() => updateCharts(() => [])}
        onDelete={deleteMultichart}
      />
      <main className='min-w-0 p-3 lg:p-5'>
        <MultichartGrid
          charts={charts}
          columns={isCompact ? 1 : columns}
          gap={gap}
          height={Math.round(200 + 2.8 * heightPercent)}
          onAdd={() => setPickerOpen(true)}
          onChange={(id, patch) =>
            updateCharts((items) =>
              items.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
              ),
            )
          }
          onRemove={(id) =>
            updateCharts((items) => items.filter((item) => item.id !== id))
          }
        />
      </main>
      <CoinScreenerSheet
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        selectedIds={selectedIds}
        onSelect={addCoin}
      />
      <CoinPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={selectedIds}
        onSelect={addCoins}
      />
      <CreateMultichartDialog open={createOpen} name={newName} onOpenChange={setCreateOpen} onNameChange={setNewName} onCreate={createMultichart} />
      <RenameMultichartDialog open={renameOpen} name={renameName} onOpenChange={setRenameOpen} onNameChange={setRenameName} onRename={renameMultichart} />
    </div>
  )
}
