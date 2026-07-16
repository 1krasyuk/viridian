import {
  ArrowUpRight,
  Flame,
  Newspaper,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import type { NewsTopic } from '../types/news'

export type Topic = {
  value: NewsTopic
  label: string
  description: string
  icon: typeof Newspaper
}

export const topics: Topic[] = [
  {
    value: 'general',
    label: 'Latest',
    description: 'All FMP market articles',
    icon: TrendingUp,
  },
  {
    value: 'crypto',
    label: 'Crypto',
    description: 'Crypto-adjacent market stories',
    icon: Flame,
  },
  {
    value: 'ai',
    label: 'AI',
    description: 'AI and chip market stories',
    icon: Sparkles,
  },
  {
    value: 'fintech',
    label: 'Fintech',
    description: 'Payments, banks, brokers',
    icon: ArrowUpRight,
  },
  {
    value: 'macro',
    label: 'Macro',
    description: 'Rates, inflation, policy',
    icon: TrendingUp,
  },
  {
    value: 'earnings',
    label: 'Earnings',
    description: 'Reports and guidance',
    icon: Newspaper,
  },
]
