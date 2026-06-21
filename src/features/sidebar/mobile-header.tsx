import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { sidebarNavItems } from './nav-items'
import { useTheme } from '@/shared/lib/theme-provider'
import { ChevronDown, DollarSign, Languages } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const themeOptions = ['light', 'dark', 'system'] as const
type ThemeOption = (typeof themeOptions)[number]

export function MobileHeader() {
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className='sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sidebar-border bg-background px-4 backdrop-blur-xl md:hidden'>
      <Link
        to='/'
        onClick={() => setOpen(false)}
        className='flex min-w-0 items-center gap-2'
      >
        <span className='relative flex size-10 shrink-0 items-center'>
          <img
            src='/logo.svg'
            alt='Viridian Logo'
            className='size-full animate-emerald-breath'
          />
          <span className='pointer-events-none absolute inset-0 overflow-hidden'>
            <span className='pixel-sparkle sparkle-1' />
            <span className='pixel-sparkle sparkle-2' />
            <span className='pixel-sparkle sparkle-3' />
          </span>
        </span>

        <span className='flex min-w-0 items-baseline font-bold text-xl tracking-wider uppercase'>
          <span className='truncate dark:text-sidebar-foreground/90'>
            Viridian
          </span>
          <span className='terminal-cursor ml-0.5 inline-block h-1 w-3 shrink-0 bg-emerald-500 shadow-[0_0_8px_#10b981]' />
        </span>
      </Link>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle menu'
            className='size-10 rounded-lg border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent focus-visible:ring-primary/30'
          >
            <span className='relative size-5'>
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-all duration-150 ease-out',
                  open ? 'top-2 rotate-45' : 'top-1',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-all duration-150 ease-out',
                  open ? 'top-2 -rotate-45' : 'top-3.5',
                )}
              />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='end'
          side='bottom'
          alignOffset={16}
          sideOffset={12}
          className='h-[calc(100svh-4rem)] w-screen max-w-none gap-0 overflow-y-auto rounded-none border-x-0 border-b-0 border-t border-sidebar-border bg-background p-4 shadow-none backdrop-blur-xl duration-150 data-open:slide-in-from-top-2'
        >
          <div className='mx-auto flex min-h-full w-full max-w-md flex-col gap-6'>
            <nav
              aria-label='Mobile navigation'
              className='grid w-full grid-cols-2 gap-3'
            >
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ 'data-active': true }}
                  onClick={() => setOpen(false)}
                  className='group flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 px-3 py-4 text-center text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent data-[active=true]:border-primary/50 data-[active=true]:bg-primary/15 data-[active=true]:text-primary'
                >
                  <item.icon className='size-7 stroke-[1.7] transition-transform duration-150 group-hover:-translate-y-0.5' />
                  <span className='text-sm font-bold leading-tight'>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className='mt-auto space-y-3 pb-2'>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  disabled
                  variant='secondary'
                  className='h-9 justify-center gap-2 rounded-lg border border-sidebar-border'
                >
                  <Languages className='opacity-80' />
                  English
                  <ChevronDown className='size-4 opacity-70' />
                </Button>

                <Button
                  disabled
                  variant='secondary'
                  className='h-9 justify-center gap-2 rounded-lg border border-sidebar-border'
                >
                  <DollarSign className='opacity-80' />
                  USD
                  <ChevronDown className='size-4 opacity-70' />
                </Button>
              </div>

              <Tabs
                value={theme}
                onValueChange={(value) => setTheme(value as ThemeOption)}
              >
                <TabsList className='grid w-full grid-cols-3'>
                  {themeOptions.map((mode) => (
                    <TabsTrigger key={mode} value={mode} className='capitalize'>
                      {mode}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  )
}
