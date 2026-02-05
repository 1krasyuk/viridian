import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/features/sidebar/app-sidebar'

export const Route = createRootRoute({
  component: RootComponent,
})

function getCookie(name: string) {
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=')
    if (key === name) return decodeURIComponent(value)
  }
  return null
}

function RootComponent() {
  const sidebar_state = getCookie('sidebar_state')
  const defaultOpen = sidebar_state === 'true'
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <Outlet />
    </SidebarProvider>
  )
}
