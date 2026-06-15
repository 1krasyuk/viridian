import type { Table } from '@tanstack/react-table'
import type { Category } from '../../types/categories'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ChevronDown, RefreshCcw, Settings2, X } from 'lucide-react'

import { DraggableColumnItem } from './draggable-column-item'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  categories?: Category[]
  categoryValue?: Category
  onCategoryChange: (category: string | undefined) => void
  perPage: number
  onPageChange: (page: number, size?: number) => void
  onReset: () => void
  onResetColumns: () => void
  showCategoryFilter?: boolean
  showRowsSelector?: boolean
}

export function DataTableToolbar<TData>({
  table,
  categories,
  categoryValue,
  onCategoryChange,
  perPage,
  onPageChange,
  onReset,
  onResetColumns,
  showCategoryFilter = true,
  showRowsSelector = true,
}: DataTableToolbarProps<TData>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      table.setColumnOrder((items: string[]) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className='grid grid-rows-2 w-full gap-2 py-2 bg-background md:flex items-center md:justify-between px-3'>
      {showCategoryFilter ? (
        <Combobox
          items={categories || []}
          itemToStringValue={(category: Category) => category.name}
          itemToStringLabel={(category: Category) => category.name}
          value={categoryValue}
          onValueChange={(category) => {
            onCategoryChange(category?.category_id)
          }}
        >
          <ComboboxInput
            placeholder='Select a category'
            className='md:w-50 w-full rounded-lg'
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No category found.</ComboboxEmpty>
            <ComboboxList>
              {(category) => (
                <ComboboxItem key={category.category_id} value={category}>
                  {category.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : (
        <div />
      )}

      <div className='flex justify-between w-full md:max-w-75 items-center'>
        <Dialog>
          <DialogTrigger>
            <Button variant='outline' className=''>
              Columns
              <Settings2 />
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-card grid-rows-[auto_minmax(0,1fr)_auto] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] gap-4 overflow-hidden rounded-3xl p-4 sm:max-w-3xl sm:gap-6 sm:rounded-4xl sm:p-6'>
            <DialogHeader className='pr-10'>
              <DialogTitle className='flex flex-wrap items-center gap-y-1 leading-snug'>
                Choose up to
                <Badge
                  className='px-2 mx-2 rounded-md text-sm font-bold'
                  variant={
                    table.getVisibleLeafColumns().length - 2 < 12
                      ? 'outline'
                      : 'destructive'
                  }
                >
                  {table.getVisibleLeafColumns().length - 2}/12
                </Badge>
                metrics
              </DialogTitle>
              <DialogDescription>
                Add, delete and sort metrics just how you need it
              </DialogDescription>
            </DialogHeader>
            <div className='min-h-0 overflow-y-auto overscroll-contain pr-1 -mr-1'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground mb-3'>
                  Selected Columns
                </p>
                <div className='flex flex-wrap gap-2 min-h-10 p-2 bg-accent/50 rounded-xl'>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={table
                        .getVisibleLeafColumns()
                        .filter((col) => col.getCanHide())
                        .map((col) => col.id)}
                      strategy={() => null}
                    >
                      {table
                        .getVisibleLeafColumns()
                        .filter((col) => col.getCanHide())
                        .map((column, idx) => {
                          const columnMeta = column.columnDef.meta as {
                            label?: string
                          }
                          const label = columnMeta?.label ?? column.id

                          return (
                            <DraggableColumnItem
                              key={column.id}
                              id={column.id}
                              index={idx}
                              label={label}
                              onRemove={() => column.toggleVisibility(false)}
                            />
                          )
                        })}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              <div className='space-y-5 mt-5'>
                {Object.entries(
                  table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .reduce<
                      Record<string, ReturnType<typeof table.getAllLeafColumns>>
                    >((groups, column) => {
                      const category =
                        (
                          column.columnDef.meta as {
                            category?: string
                          }
                        )?.category ?? 'Other'
                      if (!groups[category]) groups[category] = []
                      groups[category].push(column)
                      return groups
                    }, {}),
                ).map(([category, cols]) => (
                  <div
                    key={category}
                    className='flex flex-col gap-2 sm:flex-row sm:items-start'
                  >
                    <span className='text-sm text-muted-foreground shrink-0 sm:w-28 sm:pt-1.5'>
                      {category}
                    </span>
                    <div className='flex flex-wrap gap-1.5 w-full sm:justify-end'>
                      {cols.map((column) => (
                        <Button
                          key={column.id}
                          variant={column.getIsVisible() ? 'soft' : 'outline'}
                          disabled={
                            !column.getIsVisible() &&
                            table.getVisibleLeafColumns().length - 2 >= 12
                          }
                          size='sm'
                          className='rounded-3xl gap-1.5 font-bold max-w-full'
                          onClick={() => column.toggleVisibility()}
                        >
                          <span className='truncate'>
                            {(
                              column.columnDef.meta as {
                                label?: string
                              }
                            )?.label ?? column.id}
                          </span>
                          {column.getIsVisible() && (
                            <X className='rounded-full bg-primary text-primary-foreground size-4 p-0.5' />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center'>
              <Button variant='destructive' onClick={onResetColumns}>
                Reset
              </Button>
              <DialogClose asChild>
                <Button>Apply changes</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {showRowsSelector && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='w-30'>
                {perPage} Rows
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='min-w-0 p-1'>
              <DropdownMenuRadioGroup
                value={String(perPage)}
                onValueChange={(value) => {
                  onPageChange(1, Number(value))
                }}
              >
                {[20, 50, 100, 200, 250].map((size) => (
                  <DropdownMenuRadioItem
                    key={size}
                    value={String(size)}
                    className='my-0.5'
                  >
                    {size} Rows
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant='outline' className='w-10 h-10 group' onClick={onReset}>
          <RefreshCcw className='transition-transform duration-500 ease-out group-active:rotate-180 group-active:duration-0' />
        </Button>
      </div>
    </div>
  )
}
