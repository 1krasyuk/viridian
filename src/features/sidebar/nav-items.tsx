import { ChartLine, Grid2X2, Newspaper, Star, WalletMinimal } from 'lucide-react'

export const sidebarNavItems = [
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
  { to: '/multichart', icon: ChartLine, label: 'Multichart' },
  { to: '/heatmap', icon: Grid2X2, label: 'Heatmap' },
  { to: '/portfolio', icon: WalletMinimal, label: 'Portfolio' },
  { to: '/news', icon: Newspaper, label: 'News' },
] as const
