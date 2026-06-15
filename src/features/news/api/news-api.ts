import { fmpHttp } from '@/shared/lib/axios-config'
import type {
  CryptoNewsArticle,
  CryptoNewsArticleRaw,
  CryptoNewsResponse,
  CryptoNewsResponseRaw,
  NewsTopic,
} from '../types/news'

type GetNewsParams = {
  topic: NewsTopic
  limit?: number
}

const NEWS_LIMIT = 60
const FILTERED_TOPIC_PAGES = 8

const topicMatchers: Partial<Record<NewsTopic, RegExp>> = {
  crypto:
    /\b(bitcoin|btc|ethereum|eth|crypto|cryptocurrency|blockchain|coinbase|coin|mstr|microstrategy|mara|riot|cifr|hive|fufu|btdr|corz|wulf|bitfarms|stablecoin|digital asset|tokenization)\b/i,
  ai: /\b(ai|artificial intelligence|semiconductor|chip|nvidia|data center|cloud)\b/i,
  fintech:
    /\b(fintech|payments|paypal|stripe|visa|mastercard|bank|exchange|brokerage|lending)\b/i,
  macro:
    /\b(fed|federal reserve|inflation|rates|treasury|tariff|jobs|gdp|macro|dollar)\b/i,
  earnings:
    /\b(earnings|revenue|guidance|profit|loss|quarter|q1|q2|q3|q4|eps)\b/i,
}

function articleId(article: CryptoNewsArticleRaw, index: number) {
  return article.link ?? `${article.site ?? 'source'}-${article.title ?? index}`
}

function textFromHtml(value: string | undefined) {
  if (!value) return ''

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeArticle(
  article: CryptoNewsArticleRaw,
  index: number,
): CryptoNewsArticle | null {
  const title = article.title?.trim()
  const link = article.link

  if (!title || !link) {
    return null
  }

  const site = article.site ?? 'Financial Modeling Prep'
  const symbol = article.tickers ?? null

  return {
    id: articleId(article, index),
    title,
    link,
    description: textFromHtml(article.content),
    pubDate: article.date ?? null,
    source: site,
    author: article.author ?? null,
    image: article.image ?? null,
    symbol,
    category: symbol,
    tags: symbol ? [symbol] : [],
  }
}

function normalizeResponse(data: CryptoNewsResponseRaw): CryptoNewsResponse {
  const articles = data
    .map((article, index) => normalizeArticle(article, index))
    .filter((article): article is CryptoNewsArticle => article !== null)

  return {
    articles,
    totalCount: articles.length,
    fetchedAt: new Date().toISOString(),
  }
}

function sortByPublishedDate(articles: CryptoNewsArticle[]) {
  return [...articles].sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0

    return dateB - dateA
  })
}

export const newsApi = {
  async getNews({
    topic,
    limit = NEWS_LIMIT,
  }: GetNewsParams): Promise<CryptoNewsResponse> {
    const matcher = topicMatchers[topic]

    if (!matcher) {
      const { data } = await fmpHttp.get<CryptoNewsResponseRaw>(
        'fmp-articles',
        {
          params: {
            page: 0,
            limit,
          },
        },
      )

      const response = normalizeResponse(data)

      return {
        ...response,
        articles: sortByPublishedDate(response.articles),
      }
    }

    const pages = await Promise.all(
      Array.from({ length: FILTERED_TOPIC_PAGES }, (_, page) =>
        fmpHttp.get<CryptoNewsResponseRaw>('fmp-articles', {
          params: {
            page,
            limit,
          },
        }),
      ),
    )
    const response = normalizeResponse(pages.flatMap(({ data }) => data))

    const filteredArticles = sortByPublishedDate(
      response.articles.filter((article) =>
        matcher.test(
          `${article.title} ${article.description} ${article.symbol ?? ''}`,
        ),
      ),
    ).slice(0, limit)

    return {
      ...response,
      articles: filteredArticles,
      totalCount: filteredArticles.length,
    }
  },
}
