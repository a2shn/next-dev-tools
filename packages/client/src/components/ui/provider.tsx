'use client'

import type { ThemeProviderProps } from 'next-themes'
import type { ReactNode } from 'react'
import { ChakraProvider, EnvironmentProvider } from '@chakra-ui/react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'
import root from 'react-shadow/emotion'
import { system } from './system'

export function Provider(props: ThemeProviderProps): ReactNode {
  const [shadow, setShadow] = useState<HTMLElement | null>(null)
  const [cache, setCache] = useState<ReturnType<typeof createCache> | null>(
    null,
  )

  useEffect(() => {
    if (!shadow?.shadowRoot || cache)
      return
    const emotionCache = createCache({
      key: 'root',
      container: shadow.shadowRoot,
    })
    setCache(emotionCache)
  }, [shadow, cache])

  return (
    <root.div ref={setShadow} className="dark">
      {shadow && cache && (
        <EnvironmentProvider value={() => shadow.shadowRoot ?? document}>
          <CacheProvider value={cache}>
            <ChakraProvider value={system}>
              <ThemeProvider
                disableTransitionOnChange
                attribute="class"
                forcedTheme="dark"
                enableColorScheme={false}
                {...props}
              />
            </ChakraProvider>
          </CacheProvider>
        </EnvironmentProvider>
      )}
    </root.div>
  )
}
