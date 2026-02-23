import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Grip } from 'lucide-react'

export function DraggableColumnItem({
  id,
  label,
  index,
}: {
  id: string
  label: string
  index: number
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
    <div ref={setNodeRef} style={style} className='relative flex items-center'>
      {isOver && !isDragging && (
        <div className='absolute -left-1.5 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)] z-50' />
      )}

      <div
        className={cn(
          'flex items-center gap-1 bg-secondary/70 border rounded-lg px-2 py-1 text-sm font-medium',
          isDragging && 'opacity-50 border-primary',
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-muted-foreground'
        >
          <Badge
            variant='outline'
            className='px-1.5 py-0 h-5 mr-0.5 bg-background'
          >
            {index + 1}
          </Badge>
        </div>

        <span className='truncate max-w-30 text-xs'>{label}</span>

        <div
          {...attributes}
          {...listeners}
          className='ml-auto cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground/30 hover:text-foreground transition-colors'
        >
          <Grip size={16} />
        </div>
      </div>
    </div>
  )
}
