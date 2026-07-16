import { useEffect } from 'react'

export function useSearchShortcut(enabled: boolean, onOpen: () => void) {
  useEffect(() => {
    if (!enabled) return

    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTyping
      ) {
        return
      }

      event.preventDefault()
      onOpen()
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [enabled, onOpen])
}
