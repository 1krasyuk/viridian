import { Clock3 } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import type { CryptoNewsArticle } from '../types/news'

function formatDate(value: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function sourceInitials(source: string) {
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function NewsImage({
  article,
  className,
  priority = false,
}: {
  article: CryptoNewsArticle
  className: string
  priority?: boolean
}) {
  if (article.image) {
    return (
      <img
        src={article.image}
        alt=''
        loading={priority ? 'eager' : 'lazy'}
        className={className}
      />
    )
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_18%,transparent),color-mix(in_oklch,var(--muted)_85%,transparent))] text-2xl font-bold text-primary`}
    >
      {sourceInitials(article.source)}
    </div>
  )
}

function ArticleMeta({ article }: { article: CryptoNewsArticle }) {
  return (
    <div className='flex min-w-0 items-center gap-2 text-xs text-muted-foreground'>
      <span className='font-semibold uppercase tracking-wide text-primary'>
        {article.author || 'FMP Research'}
      </span>
    </div>
  )
}

function ArticleTime({ article }: { article: CryptoNewsArticle }) {
  const published = formatDate(article.pubDate)

  if (!published) return null

  return (
    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
      <Clock3 className='size-3' />
      {published}
    </span>
  )
}

export function LeadStory({ article }: { article: CryptoNewsArticle }) {
  return (
    <a
      href={article.link}
      target='_blank'
      rel='noreferrer'
      className='group block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
    >
      <Card className='min-h-100 border-primary/15 bg-card shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-card/90'>
        <NewsImage
          article={article}
          priority
          className='aspect-[3.1/1] w-full object-cover md:aspect-[2.55/1]'
        />
        <CardHeader className='gap-4'>
          <div className='flex items-center justify-between gap-3'>
            <ArticleMeta article={article} />
            {article.symbol ? (
              <Badge variant='secondary'>{article.symbol}</Badge>
            ) : null}
          </div>
          <CardTitle className='text-2xl md:text-3xl leading-tight tracking-tight transition-colors group-hover:text-primary'>
            {article.title}
          </CardTitle>
          {article.description ? (
            <CardDescription className='line-clamp-3 text-base leading-7'>
              {article.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className='mt-auto flex items-center justify-between gap-3'>
          <span />
          <ArticleTime article={article} />
        </CardContent>
      </Card>
    </a>
  )
}

export function SideStory({
  article,
  index,
}: {
  article: CryptoNewsArticle
  index: number
}) {
  return (
    <a
      href={article.link}
      target='_blank'
      rel='noreferrer'
      className='group grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 rounded-xl border bg-card/70 p-2.5 outline-none transition-colors hover:border-primary/30 hover:bg-card focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50'
    >
      <NewsImage
        article={article}
        className='aspect-square rounded-lg object-cover'
      />
      <div className='min-w-0 space-y-1'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='font-semibold text-primary'>#{index + 2}</span>
          <span className='truncate'>{article.author || 'FMP Research'}</span>
        </div>
        <div className='line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary'>
          {article.title}
        </div>
        {article.symbol ? (
          <Badge variant='outline' className='h-5'>
            {article.symbol}
          </Badge>
        ) : null}
      </div>
    </a>
  )
}

export function ArticleCard({ article }: { article: CryptoNewsArticle }) {
  return (
    <a
      href={article.link}
      target='_blank'
      rel='noreferrer'
      className='group block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
    >
      <Card className='flex h-full flex-col bg-card/75 transition-colors group-hover:border-primary/30 group-hover:bg-card/90'>
        <NewsImage
          article={article}
          className='aspect-[2.35/1] w-full object-cover md:aspect-[1.7/1]'
        />
        <CardHeader className='flex flex-col gap-3'>
          <ArticleMeta article={article} />

          <div className='h-20 overflow-hidden'>
            <CardTitle className='line-clamp-3 text-xl leading-snug transition-colors group-hover:text-primary'>
              {article.title}
            </CardTitle>
          </div>

          <div className='h-18 overflow-hidden'>
            {article.description ? (
              <CardDescription className='line-clamp-3 leading-6'>
                {article.description}
              </CardDescription>
            ) : (
              <span className='text-sm text-muted-foreground'>—</span>
            )}
          </div>
        </CardHeader>

        <CardContent className='mt-auto flex items-center justify-between gap-3'>
          {article.symbol ? (
            <Badge variant='outline'>{article.symbol}</Badge>
          ) : (
            <span />
          )}
          <ArticleTime article={article} />
        </CardContent>
      </Card>
    </a>
  )
}
