'use client'

import * as React from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'
import { useIsMobile } from '@/shared/hooks/use-mobile'

const TooltipMobileContext = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
} | null>(null)

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  if (isMobile) {
    return (
      <TooltipMobileContext.Provider value={{ open, setOpen }}>
        <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipMobileContext.Provider>
    )
  }

  return (
    <TooltipPrimitive.Root data-slot='tooltip' {...props}>
      {children}
    </TooltipPrimitive.Root>
  )
}

function TooltipTrigger({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const isMobile = useIsMobile()
  const mobileCtx = React.useContext(TooltipMobileContext)

  if (isMobile) {
    return (
      <TooltipPrimitive.Trigger asChild {...props}>
        <span
          className='cursor-pointer inline-flex'
          onClick={() => mobileCtx?.setOpen(true)}
        >
          {children}
        </span>
      </TooltipPrimitive.Trigger>
    )
  }

  return (
    <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  side,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const isMobile = useIsMobile()

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        side={isMobile ? 'bottom' : side}
        sideOffset={isMobile ? 8 : sideOffset}
        className={cn(
          'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-lg px-3 py-2 text-sm **:data-[slot=kbd]:rounded-4xl bg-muted text-foreground z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin)',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='size-2.5 rotate-45 rounded-[2px] data-[side=left]:translate-x-[-1.5px] data-[side=right]:translate-x-[1.5px] bg-muted fill-muted z-50 translate-y-[calc(-50%-2px)]' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
