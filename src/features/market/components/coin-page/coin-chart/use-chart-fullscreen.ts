import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useChartFullscreen(
  wrapperRef: RefObject<HTMLDivElement | null>,
  onFullscreenChange: () => void,
) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setTimeout(onFullscreenChange, 100)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [onFullscreenChange])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current?.requestFullscreen()
    }
  }

  return {
    isFullscreen,
    toggleFullscreen,
  }
}
