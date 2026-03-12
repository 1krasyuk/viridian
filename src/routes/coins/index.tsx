import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/coins/')({
  loader: () => {
    throw redirect({
      to: '/',
    })
  },
})
