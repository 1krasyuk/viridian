import { Grid2X2, Layers, Newspaper, Star, WalletMinimal } from 'lucide-react'

export const sidebarNavItems = [
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
  { to: '/multichart', icon: Grid2X2, label: 'Multichart' },
  { to: '/heatmap', icon: Layers, label: 'Heatmap' },
  { to: '/portfolio', icon: WalletMinimal, label: 'Portfolio' },
  { to: '/news', icon: Newspaper, label: 'News' },
] as const
