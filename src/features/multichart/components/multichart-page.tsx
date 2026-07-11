import { useSyncExternalStore } from 'react'

import { useMultichartStore } from '../store/multichart-store'
import { MultichartGrid } from './charts/multichart-grid'
import { CoinPicker } from './coins/multichart-coin-dialog'
import { CoinScreenerSheet } from './coins/multichart-coin-screener-sheet'
import { CreateMultichartDialog } from './dialog/multichart-dialog-create'
import { RenameMultichartDialog } from './dialog/multichart-dialog-rename'
import { MultichartTabs } from './tabs/multichart-tabs'
import { MultichartToolbar } from './toolbar/multichart-toolbar'

const COMPACT_MEDIA_QUERY = '(max-width: 1023px)'

function subscribeToCompactLayout(onChange: () => void) {
  const media = window.matchMedia(COMPACT_MEDIA_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getCompactLayoutSnapshot = () =>
  window.matchMedia(COMPACT_MEDIA_QUERY).matches

export function MultichartPage() {
  const compact = useSyncExternalStore(
    subscribeToCompactLayout,
    getCompactLayoutSnapshot,
    () => false,
  )
  const store = useMultichartStore()
  const active =
    store.multicharts.find((item) => item.id === store.activeId) ??
    store.multicharts[0]
  const charts = active.charts
  const selectedIds = new Set(charts.map((item) => item.coin.id))

  return (
    <div className='min-h-[calc(100dvh-3.5rem)] bg-muted/20 md:min-h-dvh'>
      <MultichartTabs
        multicharts={store.multicharts}
        activeId={store.activeId}
        onActiveChange={store.setActiveId}
        onCreate={store.openCreateDialog}
        onReset={store.resetPage}
      />
      <MultichartToolbar
        active={active}
        chartCount={charts.length}
        columns={store.columns}
        gap={store.gap}
        heightPercent={store.heightPercent}
        globalDays={store.globalDays}
        globalDataType={store.globalDataType}
        compact={compact}
        sidebarOpen={store.sidebarOpen}
        onDaysChange={store.setDays}
        onDataTypeChange={store.setDataType}
        onColumnsChange={store.setColumns}
        onGapChange={store.setGap}
        onHeightChange={store.setHeightPercent}
        onSearch={store.openPicker}
        onToggleScreener={store.toggleSidebar}
        onRename={store.openRenameDialog}
        onMakeDefault={store.makeDefault}
        onClear={store.clearCharts}
        onDelete={store.deleteMultichart}
      />
      <main className='min-w-0 p-3 lg:p-5'>
        <MultichartGrid
          charts={charts}
          columns={compact ? 1 : store.columns}
          gap={store.gap}
          height={Math.round(200 + 2.8 * store.heightPercent)}
          onAdd={store.openPicker}
          onChange={store.updateChart}
          onRemove={store.removeChart}
        />
      </main>
      <CoinScreenerSheet
        open={store.sidebarOpen}
        onOpenChange={store.setSidebarOpen}
        selectedIds={selectedIds}
        onSelect={store.addCoin}
      />
      <CoinPicker
        open={store.pickerOpen}
        onOpenChange={store.setPickerOpen}
        selectedIds={selectedIds}
        onSelect={store.addCoins}
      />
      <CreateMultichartDialog
        open={store.createOpen}
        name={store.newName}
        onOpenChange={store.setCreateOpen}
        onNameChange={store.setNewName}
        onCreate={store.createMultichart}
      />
      <RenameMultichartDialog
        open={store.renameOpen}
        name={store.renameName}
        onOpenChange={store.setRenameOpen}
        onNameChange={store.setRenameName}
        onRename={store.renameMultichart}
      />
    </div>
  )
}
