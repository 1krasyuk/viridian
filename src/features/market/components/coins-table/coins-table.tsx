import { useState } from 'react'
import { useCategoriesList, useCoins } from '../../hooks/coins-queries'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useSearch, useNavigate } from '@tanstack/react-router'

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 100

export function CoinsTable() {
  const search = useSearch({ from: '/' })

  const page = search.page ?? DEFAULT_PAGE
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const category = search.category
  const navigate = useNavigate()

  const { data, isLoading } = useCoins(page, perPage, category)

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategoriesList()

  const handlePaginationChange = (newPage: number, newPerPage?: number) => {
    if (newPerPage !== undefined && newPerPage !== perPage) {
      setPerPage(newPerPage)
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, page: 1 }),
      })
    } else {
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, page: newPage }),
      })
    }
  }

  const handleCategoryChange = (category: string | undefined) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, category: category, page: 1 }),
    })
  }

  const isLastPage = data && data.length < perPage
  const pageCount = isLastPage ? page : page + 1

  return (
    <DataTable
      columns={columns}
      data={data || []}
      loading={isLoading}
      page={page}
      perPage={perPage}
      pageCount={pageCount}
      onPageChange={handlePaginationChange}
      categories={categoriesData}
      loadingCategories={isCategoriesLoading}
      category={category}
      onCategoryChange={handleCategoryChange}
    />
  )
}
