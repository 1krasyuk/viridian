import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  useSidebar,
} from '@/shared/ui/sidebar'
import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
  ChevronsUpDown,
  DollarSign,
  Grid2X2,
  Languages,
  Layers,
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
  const { state } = useSidebar()

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
              { to: '/multichart', icon: <Grid2X2 />, label: 'Multichart' },
              { to: '/heatmap', icon: <Layers />, label: 'Heatmap' },
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
      <SidebarFooter className=''>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className='
              w-full h-12 shrink-0
              flex items-center justify-center
              rounded-lg border border-sidebar-border/90 bg-sidebar-accent/50
              hover:bg-sidebar-accent transition-none
       
              group-data-[collapsible=icon]:size-8!
              group-data-[collapsible=icon]:justify-center
              group-data-[collapsible=icon]:bg-accent!
            '
                >
                  <div className='flex items-center gap-2 group-data-[collapsible=icon]:gap-0'>
                    <Settings className='size-5! shrink-0 group-data-[collapsible=icon]:size-5' />
                    <span className='truncate font-medium text-sm tracking-widest  group-data-[collapsible=icon]:hidden'>
                      Settings
                    </span>
                  </div>

                  <ChevronsUpDown className='size-4 opacity-50 group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={state === 'collapsed' ? 'right' : 'top'}
                align={state === 'collapsed' ? 'end' : 'center'}
                sideOffset={state === 'collapsed' ? 16 : 12}
                alignOffset={2}
                className='
            w-48 rounded-xl border border-border/50 
            bg-popover/80 backdrop-blur-xl p-1.5 shadow-xl
            animate-in zoom-in-95 slide-in-from-bottom-20
          '
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-accent'
                >
                  <div className='relative size-4 flex items-center justify-center'>
                    <Sun className='size-full rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
                    <Moon className='absolute inset-0 size-full rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
                  </div>
                  <span className='font-medium text-xs'>Appearance</span>
                  <span className='ml-auto text-[9px] px-1.5 py-0.5 border border-border rounded-md bg-muted uppercase'>
                    {theme}
                  </span>
                </DropdownMenuItem>

                <div className='my-1 h-px bg-border/40' />

                <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-accent'>
                  <Languages className='size-4 opacity-80' />
                  <span className='font-medium text-xs'>Language</span>
                  <div className='ml-auto flex items-center gap-1 opacity-50 text-[10px]'>
                    <span>ENG</span>
                    <ChevronRight className='size-3' />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-accent'>
                  <DollarSign className='size-4 opacity-80' />
                  <span className='font-medium text-xs'>Currency</span>
                  <div className='ml-auto flex items-center gap-1 opacity-50 text-[10px]'>
                    <span>USD</span>
                    <ChevronRight className='size-3' />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
