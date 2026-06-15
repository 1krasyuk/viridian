import { Newspaper, Search } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

type NewsEmptyStateProps = {
  action?: {
    disabled?: boolean
    label: string
    onClick: () => void
  }
  description: string
  title: string
}

export function NewsEmptyState({
  action,
  description,
  title,
}: NewsEmptyStateProps) {
  return (
    <Empty className='min-h-96 border bg-card/40'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Newspaper />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? (
        <EmptyContent>
          <Button onClick={action.onClick} disabled={action.disabled}>
            <Search />
            {action.label}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
