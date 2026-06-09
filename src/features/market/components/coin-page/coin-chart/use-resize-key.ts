import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useResizeKey(ref: RefObject<HTMLElement | null>) {
  const [resizeKey, setResizeKey] = useState(0)
  const bumpResizeKey = useCallback(() => setResizeKey((prev) => prev + 1), [])

  useEffect(() => {
    const ro = new ResizeObserver(bumpResizeKey)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [bumpResizeKey, ref])

  return {
    resizeKey,
    bumpResizeKey,
  }
}
