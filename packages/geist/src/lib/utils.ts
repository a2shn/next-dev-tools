import type { DynamicSegment } from '@next-dev-tools/shared/types'

export function addDynamicSegmentInfo(
  segments: DynamicSegment[],
  rationale: string[],
  context?: string,
): void {
  if (segments.length === 0)
    return

  const segmentDescriptions = segments.map((seg) => {
    let desc = seg.segment
    if (seg.catchAll && seg.optional) {
      desc = `...${seg.segment}? (optional catch-all)`
    }
    else if (seg.catchAll) {
      desc = `...${seg.segment} (catch-all)`
    }
    else if (seg.optional) {
      desc = `${seg.segment}? (optional)`
    }

    if (seg.isFilename) {
      desc += ' (filename)'
    }

    return desc
  })

  const contextSuffix = context ? ` ${context}` : ''
  rationale.push(
    `Dynamic segments: ${segmentDescriptions.join(', ')}${contextSuffix}`,
  )
}
