import React, {useRef, useEffect} from 'react'

// @TODO use `import {useForwardedRef} from '@sanity/ui'`
export function useForwardedRef<T>(ref: React.ForwardedRef<T>): React.MutableRefObject<T | null> {
  const innerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!ref) return

    if (typeof ref === 'function') {
      ref(innerRef.current)
    } else {
      ref.current = innerRef.current
    }
  })

  return innerRef
}
