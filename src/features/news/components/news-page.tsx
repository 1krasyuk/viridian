import { useMemo } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { RefreshCcw } from 'lucide-react'

import { useWatchlistStore } from '@/features/watchlist/store/watchlist-store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useCryptoNews } from '../hooks/news-queries'
import type { NewsTopic } from '../types/news'
import { NewsEmptyState } from './news-empty-state'
import { NewsSkeleton } from './news-skeleton'
import { ArticleCard, LeadStory, SideStory } from './news-story-cards'
import { topics } from './news-topics'

export function NewsPage() {
  const search = useSearch({ from: '/news' })
  const navigate = useNavigate({ from: '/news' })
  const topic = search.topic ?? 'general'
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCryptoNews(topic)
  const watchlistCoins = useWatchlistStore((state) => state.coins)

  const selectedTopic = topics.find((item) => item.value === topic) ?? topics[0]
  const articles = data?.articles ?? []
  const [leadArticle, ...restArticles] = articles
  const sideArticles = restArticles.slice(0, 4)
  const gridArticles = restArticles.slice(4)

  const watchlistSymbols = useMemo(
    () =>
      watchlistCoins
        .slice(0, 10)
        .map((coin) => coin.symbol.toUpperCase())
        .join(', '),
    [watchlistCoins],
  )

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_30rem)] px-4 py-6 md:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-8xl flex-col gap-6'>
        <header className='grid gap-5 border-b pb-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end'>
          <div className='max-w-4xl space-y-2'>
            <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>
              Market Briefing
            </h1>
            <p className='max-w-3xl text-sm leading-6 text-muted-foreground md:text-base'>
              Follow the stories shaping crypto-adjacent markets, macro
              sentiment, fintech, earnings, and high-conviction watchlist names.
            </p>
          </div>

          <div className='rounded-xl border bg-background/70 p-4 text-sm shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground'>Watchlist context</span>
              <Badge variant='secondary'>{watchlistCoins.length}</Badge>
            </div>
            <div className='mt-2 min-h-5 font-medium'>
              {watchlistSymbols || (
                <Link to='/' className='text-primary hover:underline'>
                  Add coins to tune your reading
                </Link>
              )}
            </div>
          </div>
        </header>

        <Tabs
          value={topic}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, topic: value as NewsTopic }),
            })
          }
          className='gap-5'
        >
          <div className='overflow-x-auto pb-1'>
            <TabsList className='min-w-max'>
              {topics.map((item) => {
                const Icon = item.icon
                return (
                  <TabsTrigger key={item.value} value={item.value}>
                    <Icon />
                    {item.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </Tabs>

        <div className='flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight'>
              {selectedTopic.label}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {selectedTopic.description}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw />
            Refresh
          </Button>
        </div>

        {isLoading ? <NewsSkeleton /> : null}

        {isError ? (
          <NewsEmptyState
            title='News feed unavailable'
            description={
              error instanceof Error
                ? error.message
                : 'Financial Modeling Prep did not return articles.'
            }
            action={{
              disabled: isFetching,
              label: 'Try again',
              onClick: () => refetch(),
            }}
          />
        ) : null}

        {!isLoading && !isError && articles.length === 0 ? (
          <NewsEmptyState
            title='No articles found'
            description='Try another topic or refresh the feed.'
          />
        ) : null}

        {!isLoading && !isError && leadArticle ? (
          <>
            <section className='grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]'>
              <LeadStory article={leadArticle} />
              <div className='grid content-start gap-3'>
                <div className='flex items-center justify-between border-b pb-2'>
                  <h3 className='font-semibold'>Top stories</h3>
                  <span className='text-xs text-muted-foreground'>
                    {data?.totalCount ?? articles.length} posts
                  </span>
                </div>
                {sideArticles.map((article, index) => (
                  <SideStory key={article.id} article={article} index={index} />
                ))}
              </div>
            </section>

            <section className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
