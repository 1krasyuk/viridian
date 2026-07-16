import { Button } from '@/shared/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTablePaginationProps {
  page: number
  perPage: number
  pageCount: number
  loading?: boolean
  onPageChange: (page: number, size?: number) => void
}

export function DataTablePagination({
  page,
  perPage,
  pageCount,
  loading,
  onPageChange,
}: DataTablePaginationProps) {
  return (
    <div className='flex flex-col items-center gap-3 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
      <span className='text-sm text-muted-foreground sm:justify-self-start'>
        Showing {(page - 1) * perPage + 1} to {page * perPage}
      </span>

      <div className='flex justify-center gap-2 sm:justify-self-center'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1, perPage)}
          disabled={page <= 1 || loading}
          className='min-w-25'
        >
          <ChevronLeft />
          <span>Coins</span>
          {page > 1 ? (
            <>
              {(page - 2) * perPage + 1} - {(page - 1) * perPage}
            </>
          ) : (
            <>
              {(page - 1) * perPage + 1} to {page * perPage}
            </>
          )}
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1, perPage)}
          disabled={page >= pageCount || loading}
          className='min-w-25'
        >
          <span>Coins</span>
          {page * perPage + 1} - {(page + 1) * perPage}
          <ChevronRight />
        </Button>
      </div>

      <div aria-hidden='true' className='hidden sm:block' />
    </div>
  )
}
