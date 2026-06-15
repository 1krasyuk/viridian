import { useQuery } from '@tanstack/react-query'

import { newsApi } from '../api/news-api'
import type { NewsTopic } from '../types/news'

export const newsKeys = {
  all: ['news'] as const,
  topic: (topic: NewsTopic) => [...newsKeys.all, topic] as const,
}

export function useCryptoNews(topic: NewsTopic) {
  return useQuery({
    queryKey: newsKeys.topic(topic),
    queryFn: () => newsApi.getNews({ topic }),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
