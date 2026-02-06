import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/shared/ui/sidebar'
import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
  DollarSign,
  Grid2X2,
  Languages,
  Moon,
  Newspaper,
  Settings,
  Star,
  Sun,
  WalletMinimal,
} from 'lucide-react'
import { useTheme } from '@/shared/lib/theme-provider'

export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='flex'>
        <div className='relative group-data-[state=expanded]:p-2 flex items-center gap-2 group-data-[collapsible=icon]:px-0 justify-start group-data-[state=collapsed]:flex-col border-b pb-2'>
          <SidebarTrigger className='group-data-[state=expanded]:hidden rotate-180 secondary dark:hover:bg-accent w-full bg-border border-0 rounded-none' />
          <Link to='/' className='relative size-10 shrink-0 flex items-center'>
            <img
              src='/logo.svg'
              alt='Viridian Logo'
              className='size-full animate-emerald-breath relative z-0'
            />

            <div className='absolute inset-0 z-10 overflow-hidden pointer-events-none'>
              <div className='pixel-sparkle sparkle-1' />
              <div className='pixel-sparkle sparkle-2' />
              <div className='pixel-sparkle sparkle-3' />
            </div>
          </Link>

          <Link
            to='/'
            className='font-bold text-2xl tracking-wider uppercase truncate group-data-[collapsible=icon]:hidden flex items-baseline'
          >
            <span className='dark:text-sidebar-foreground/90 '>Viridian</span>
            <span className='terminal-cursor ml-0.5 inline-block w-3 h-1 bg-emerald-500 shadow-[0_0_8px_#10b981]' />
          </Link>

          <SidebarTrigger className='absolute top-0 right-0 group-data-[state=collapsed]:hidden secondary dark:hover:bg-transparent' />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className='gap-1'>
            {[
              { to: '/watchlist', icon: <Star />, label: 'Watchlist' },
              { to: '/heatmap', icon: <Grid2X2 />, label: 'Heatmap' },
              { to: '/portfolio', icon: <WalletMinimal />, label: 'Portfolio' },
              { to: '/news', icon: <Newspaper />, label: 'News' },
            ].map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  className='
                    transition-colors duration-200 ease-in-out
                    text-sidebar-foreground/70
                    px-2 rounded-sm
                 
                  hover:bg-black/15   
                    dark:hover:bg-foreground/15
                    dark:hover:text-foreground
                    
                    dark:data-[active=true]:bg-primary/15 
                    dark:data-[active=true]:text-primary
                    
                    data-[active=true]:bg-primary/30
                    data-[active=true]:text-primary
                    data-[active=true]:font-bold
                    data-[active=true]:transition-none
                    active:bg-bg-black/15 

                    [&_svg]:size-6
                    [&_svg]:stroke-[1.5]
                    group-data-[collapsible=icon]:justify-center
                    text-md
                  '
                >
                  <Link to={item.to} activeProps={{ 'data-active': true }}>
                    {item.icon}
                    <span className='group-data-[collapsible=icon]:hidden'>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='group p-0 border-t border-sidebar-border/50'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className='
                  w-full h-14
                  rounded-none 
                  flex justify-center 
                  shrink-0
                  group-data-[collapsible=icon]:size-12! 
                  bg-accent!'
                >
                  <Settings className='size-5! shrink-0 group-data-[collapsible=icon]:size-5' />
                  <span className='group-data-[collapsible=icon]:hidden font-medium tracking-widest uppercase text-xs'>
                    Settings
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side='top'
                align='start'
                sideOffset={1}
                className='
                rounded-none 
                border border-border
                p-0 
              '
              >
                {/* Theme */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className='
                  w-full flex items-center gap-3 px-4 py-3.5 
                  text-xs text-popover-foreground transition-all duration-200
                  hover:bg-accent hover:text-accent-foreground
                  group/btn
                '
                >
                  <div className='relative size-4 flex items-center justify-center'>
                    <Sun className='size-full transition-all scale-100 rotate-0 dark:scale-0 dark:rotate-90 opacity-100 dark:opacity-0' />
                    <Moon className='absolute inset-0 size-full transition-all scale-0 dark:scale-100  opacity-0 dark:opacity-90' />
                  </div>
                  <span className='font-medium tracking-wide'>Appearance</span>
                  <span className='ml-auto text-[9px] px-1.5 py-0.5 border border-border rounded-sm bg-muted text-muted-foreground uppercase'>
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>

                {/* Language */}
                <button
                  className='
                  w-full flex items-center gap-3 px-4 py-3.5 
                  text-xs text-popover-foreground transition-all duration-200
                  hover:bg-accent hover:text-accent-foreground
                '
                >
                  <Languages className='size-4 opacity-90' />
                  <span className='font-medium tracking-wide'>Language</span>
                  <div className='ml-auto flex items-center gap-1 opacity-50 text-[10px]'>
                    <span>ENG</span>
                    <ChevronRight className='size-3' />
                  </div>
                </button>

                {/* Currency */}
                <button
                  className='
                  w-full flex items-center gap-3 px-4 py-3.5 
                  text-xs text-popover-foreground transition-all duration-200
                  hover:bg-accent hover:text-accent-foreground
                '
                >
                  <DollarSign className='size-4 opacity-90' />
                  <span className='font-medium tracking-wide'>Currency</span>
                  <div className='ml-auto flex items-center gap-1 opacity-50 text-[10px]'>
                    <span>USD</span>
                    <ChevronRight className='size-3' />
                  </div>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
