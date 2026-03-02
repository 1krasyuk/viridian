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
    <div className='flex items-center flex-col py-4'>
      <div className='flex gap-2 justify-center '>
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
              {(page - 1) * perPage + 1} to {page * perPage}{' '}
            </>
          )}
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1, perPage)}
          disabled={page >= pageCount || loading}
          className=' min-w-25'
        >
          <span>Coins</span>
          {page * perPage + 1} - {(page + 1) * perPage}
          <ChevronRight />
        </Button>
      </div>
      <span className='text-sm text-muted-foreground my-3 '>
        Showing {(page - 1) * perPage + 1} to {page * perPage}
      </span>
    </div>
  )
}
