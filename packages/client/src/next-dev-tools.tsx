'use client'
import type { ReactNode } from 'react'
import { FloatingDevPopover } from './components/floating-dev-popover'
import { Provider } from './components/ui/provider'

export default function NextDevTools(): ReactNode {
  return (
    <Provider>
      <FloatingDevPopover>
        <p>g</p>
      </FloatingDevPopover>
    </Provider>
  )
}
