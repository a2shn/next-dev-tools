'use client'

import type { ReactNode } from 'react'
import { Box, Float, IconButton, Popover, Portal, Status } from '@chakra-ui/react'
import { RiNextjsFill } from 'react-icons/ri'

export function FloatingDevPopover({ children }: {
  children: ReactNode
}): ReactNode {
  return (
    <Box position="fixed" bottom="4" right="4" zIndex="9999">
      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton
            position="relative"
            size="md"
            rounded="full"
            aria-label="Open dev tools"
          >
            <RiNextjsFill style={{ width: '100%', height: '100%', color: 'black' }} />
            <Float>
              <Status.Root colorPalette="green">
                <Status.Indicator />
              </Status.Root>
            </Float>
          </IconButton>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body>
                {children}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Box>
  )
}
