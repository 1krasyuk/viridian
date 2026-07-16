import { Outlet, createRootRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/features/sidebar/app-sidebar'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/query-client'
import { MobileHeader } from '@/features/sidebar/mobile-header'

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
  const sidebar_state = getCookie('sidebar_state') ?? 'true'
  const defaultOpen = sidebar_state === 'true'
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />

        <main className='flex-1 min-w-0'>
          <MobileHeader />
          <Outlet />
        </main>
      </SidebarProvider>
    </QueryClientProvider>
  )
}
