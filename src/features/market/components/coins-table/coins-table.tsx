import { useCoins } from '../../hooks/coins-queries'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useSearch, useNavigate } from '@tanstack/react-router'

export function CoinsTable() {
  const { page, per_page } = useSearch({ from: '/' })
  const navigate = useNavigate()
  const { data, isLoading } = useCoins(page, per_page)

  const handlePaginationChange = (newPage: number, newPerPage: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page: newPage, per_page: newPerPage }),
    })
  }

  const isLastPage = data && data.length < per_page
  const pageCount = isLastPage ? page : page + 1

  console.log(data)

  return (
    <DataTable
      columns={columns}
      data={data || []}
      loading={isLoading}
      page={page}
      perPage={per_page}
      pageCount={pageCount}
      onPageChange={handlePaginationChange}
    />
  )
}
