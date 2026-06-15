export type NewsTopic =
  | 'general'
  | 'crypto'
  | 'ai'
  | 'fintech'
  | 'macro'
  | 'earnings'

export type CryptoNewsArticleRaw = {
  title?: string
  date?: string
  content?: string
  tickers?: string
  image?: string
  link?: string
  author?: string
  site?: string
}

export type CryptoNewsArticle = {
  id: string
  title: string
  link: string
  description: string
  pubDate: string | null
  source: string
  author: string | null
  image: string | null
  symbol: string | null
  category: string | null
  tags: string[]
}

export type CryptoNewsResponseRaw = CryptoNewsArticleRaw[]

export type CryptoNewsResponse = {
  articles: CryptoNewsArticle[]
  totalCount: number
  fetchedAt: string | null
}
