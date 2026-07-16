import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock3, Newspaper } from 'lucide-react'

import type { CryptoNewsArticle } from '@/features/news/types/news'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

function formatArticleDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function NewsCard({ article }: { article: CryptoNewsArticle }) {
  const published = formatArticleDate(article.pubDate)

  return (
    <a
      href={article.link}
      target='_blank'
      rel='noreferrer'
      className='group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-transparent transition-colors hover:border-primary/30 hover:bg-muted/25'
    >
      {article.image ? (
        <img
          src={article.image}
          alt=''
          loading='lazy'
          className='h-36 w-full object-cover lg:h-40'
        />
      ) : (
        <div className='flex h-36 w-full items-center justify-center bg-primary/10 lg:h-40'>
          <Newspaper className='size-10 text-primary' />
        </div>
      )}
      <div className='flex flex-1 flex-col p-4'>
        <p className='truncate text-sm font-semibold text-primary'>
          {article.author || article.source}
        </p>
        <h3 className='mt-3 line-clamp-3 text-xl font-semibold leading-snug transition-colors group-hover:text-primary'>
          {article.title}
        </h3>
        {article.description && (
          <p className='mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground'>
            {article.description}
          </p>
        )}
        <div className='mt-auto flex min-h-5 items-center justify-between gap-3 pt-4'>
          {article.symbol ? (
            <Badge variant='secondary' className='h-5 text-[10px]'>
              {article.symbol}
            </Badge>
          ) : (
            <span />
          )}
          {published && (
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Clock3 className='size-3.5' /> {published}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

function NewsCardsSkeleton() {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className='overflow-hidden rounded-xl border'>
          <Skeleton className='h-36 w-full rounded-none lg:h-40' />
          <div className='space-y-3 p-4'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-5 w-4/5' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MarketLatestNews({
  articles,
  isLoading,
  isError,
}: {
  articles: CryptoNewsArticle[]
  isLoading: boolean
  isError: boolean
}) {
  return (
    <section className='space-y-3 px-1 pt-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/45'>
            <Newspaper className='size-5 text-foreground' />
          </div>
          <div>
            <h2 className='text-2xl font-semibold tracking-tight'>Latest news</h2>
            <p className='text-sm text-muted-foreground'>
              Fresh market stories from the latest briefing.
            </p>
          </div>
        </div>
        <Button asChild variant='ghost' size='sm' className='shrink-0'>
          <Link to='/news'>
            View all <ArrowRight />
          </Link>
        </Button>
      </div>

      {isLoading && <NewsCardsSkeleton />}
      {!isLoading && !isError && articles.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
      {!isLoading && (isError || articles.length === 0) && (
        <div className='flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed text-center'>
          <Newspaper className='mb-3 size-8 text-muted-foreground' />
          <p className='font-semibold'>News feed is unavailable</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            Open the briefing to try again.
          </p>
        </div>
      )}
    </section>
  )
}
