import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Grip, Trash2 } from 'lucide-react'

export function DraggableColumnItem({
  id,
  label,
  index,
  onRemove,
}: {
  id: string
  label: string
  index: number
  onRemove?: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='relative flex w-full items-center sm:w-auto'
    >
      {isOver && !isDragging && (
        <div className='absolute -left-1.5 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)] z-50' />
      )}

      <div
        className={cn(
          'flex min-h-12 w-full items-center gap-3 rounded-xl border bg-secondary/70 px-3 py-2 text-sm font-medium sm:min-h-0 sm:w-auto sm:gap-1 sm:rounded-lg sm:px-2 sm:py-1',
          isDragging && 'opacity-50 border-primary',
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-muted-foreground'
        >
          <Grip className='size-5 sm:hidden' />
          <Badge
            variant='outline'
            className='hidden px-1.5 py-0 h-5 mr-0.5 bg-background sm:inline-flex'
          >
            {index + 1}
          </Badge>
        </div>

        <span className='min-w-0 flex-1 truncate text-sm sm:max-w-30 sm:flex-none sm:text-xs'>
          {label}
        </span>

        {onRemove && (
          <button
            type='button'
            aria-label={`Remove ${label}`}
            className='-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden'
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <Trash2 className='size-4' />
          </button>
        )}

        <div
          {...attributes}
          {...listeners}
          className='ml-auto hidden cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground/30 hover:text-foreground transition-colors sm:block'
        >
          <Grip size={16} />
        </div>
      </div>
    </div>
  )
}
