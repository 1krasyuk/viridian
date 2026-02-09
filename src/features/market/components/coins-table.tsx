import { useCoins } from '../hooks/coins-queries'

export function CoinsTable() {
  const { data } = useCoins()
  console.log(data)
  return null
}
