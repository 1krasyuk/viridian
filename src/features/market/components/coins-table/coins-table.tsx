import { useCoins } from '../../hooks/coins-queries'
import { columns } from './columns'
import { DataTable } from './data-table'

export function CoinsTable() {
  const { data, isLoading } = useCoins()

  console.log(data)

  return <DataTable columns={columns} data={data || []} loading={isLoading} />
}
