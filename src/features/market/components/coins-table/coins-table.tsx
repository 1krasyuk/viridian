import { useCategoriesList, useCoins } from '../../hooks/coins-queries'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useSearch, useNavigate } from '@tanstack/react-router'

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 100

export function CoinsTable() {
  const search = useSearch({ from: '/' })

  const page = search.page ?? DEFAULT_PAGE
  const per_page = search.per_page ?? DEFAULT_PER_PAGE
  const navigate = useNavigate()
  const { data, isLoading } = useCoins(page, per_page)
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategoriesList()

  const handlePaginationChange = (newPage: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page: newPage }),
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
      categories={categoriesData} // <--- Передаем массив
      loadingCategories={isCategoriesLoading}
    />
  )
}
