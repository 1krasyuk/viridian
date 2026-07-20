import { useQuery } from '@tanstack/react-query'

import { newsApi } from '../api/news-api'
import type { NewsTopic } from '../types/news'

export const newsKeys = {
  all: ['news'] as const,
}

export function useCryptoNews(topic: NewsTopic) {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: () => newsApi.getNews(),
    select: (response) => newsApi.selectTopic(response, topic),
    staleTime: 30 * 60_000,
    gcTime: 2 * 60 * 60_000,
    refetchInterval: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
