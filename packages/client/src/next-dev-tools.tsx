'use client'

import type { ReactNode } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider, Global } from '@emotion/react'
/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react'
import { Scope } from 'react-shadow-scope'
import { theme as themeCss } from './theme'
import { Button } from './ui/button'

export default function NextDevTools(): ReactNode {
  const scopeRef = useRef<HTMLDivElement>(null)
  const [cache, setCache] = useState<any>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (stored)
        return stored
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = scopeRef.current?.shadowRoot
    if (root && !cache) {
      setCache(createCache({ key: 'shadow', container: root }))
    }
  }, [cache])

  useEffect(() => {
    const host = scopeRef.current?.shadowRoot?.host
    if (host) {
      host.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const toggleTheme = (): void => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  return (
    <Scope ref={scopeRef}>
      {cache && (
        <CacheProvider value={cache}>
          <Global styles={themeCss} />
          <Button onClick={toggleTheme}>Toggle Theme</Button>
        </CacheProvider>
      )}
    </Scope>
  )
}
