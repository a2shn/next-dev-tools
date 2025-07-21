import { expect, it } from 'vitest'
import { detectRoutingStrategy } from '.'

it('detects getStaticProps (function declaration)', () => {
  const code = `
    export function getStaticProps() {
      return { props: {} }
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasGetStaticProps).toBe(true)
})

it('detects getStaticProps (arrow declaration)', () => {
  const code = `
    export const getStaticProps = () => {
      return { props: {} }
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasGetStaticProps).toBe(true)
})

it('detects getServerSideProps', () => {
  const code = `
    export async function getServerSideProps() {
      return { props: {} }
    }
  `
  const result = detectRoutingStrategy(code, '/pages/index.tsx')
  expect(result.detectedFeatures.hasGetServerSideProps).toBe(true)
})

it('detects generateMetadata and generateStaticParams', () => {
  const code = `
    export const generateMetadata = () => ({ title: 'Hello' })
    export async function generateStaticParams() {
      return []
    }
  `
  const result = detectRoutingStrategy(code, '/app/blog/page.tsx')
  expect(result.detectedFeatures.hasGenerateMetadata).toBe(true)
  expect(result.detectedFeatures.hasGenerateStaticParams).toBe(true)
})

it('detects metadata object', () => {
  const code = `
    export const metadata = {
      title: 'Example Title',
      description: 'Example description'
    }
  `
  const result = detectRoutingStrategy(code, '/app/layout.tsx')
  expect(result.detectedFeatures.hasMetadata).toBe(true)
})

it('detects revalidate value', () => {
  const code = `
    export const revalidate = 60
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasRevalidate).toBe(true)
  expect(result.detectedFeatures.revalidateValue).toBe(60)
})

it('detects runtime value', () => {
  const code = `
    export const runtime = 'edge'
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.runtime).toBe('edge')
})

it('detects fetchCache value', () => {
  const code = `
    export const fetchCache = 'force-cache'
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.fetchCache).toBe('force-cache')
})

it('detects dynamic value', () => {
  const code = `
    export const dynamic = 'force-dynamic'
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.dynamic).toBe('force-dynamic')
})

it('detects cookies usage from next/headers', () => {
  const code = `
    import { cookies } from 'next/headers'
    export default function Page() {
      const c = cookies()
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesCookies).toBe(true)
})

it('detects headers usage from next/headers', () => {
  const code = `
    import { headers } from 'next/headers'
    export default function Page() {
      const h = headers()
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesHeaders).toBe(true)
})

it('detects useSearchParams usage from next/navigation', () => {
  const code = `
    import { useSearchParams } from 'next/navigation'
    export default function Page() {
      const s = useSearchParams.get('key')
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesSearchParams).toBe(true)
})

it('detects notFound usage', () => {
  const code = `
    import { notFound } from 'next/navigation'
    export default function Page() {
      if (Math.random() > 0.5) notFound()
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesNotFound).toBe(true)
})

it('detects redirect usage', () => {
  const code = `
    import { redirect } from 'next/navigation'
    export default function Page() {
      redirect('/home')
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesRedirect).toBe(true)
})

it('detects unstable_cache usage', () => {
  const code = `
    import { unstable_cache } from 'next/cache'
    const handler = unstable_cache(() => 'data')
    handler()
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.usesUnstableCache).toBe(true)
})

it('detects fetch with no-store', () => {
  const code = `
    export default async function Page() {
      await fetch('/api', { cache: 'no-store' })
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasFetchWithNoStore).toBe(true)
})

it('detects fetch with force-cache', () => {
  const code = `
    export default async function Page() {
      await fetch('/api', { cache: 'force-cache' })
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasFetchWithForceCache).toBe(true)
})

it('detects client component (use client directive)', () => {
  const code = `
    'use client'
    export default function Page() {
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.isClientComponent).toBe(true)
})

it('detects useEffect usage', () => {
  const code = `
    import { useEffect } from 'react'
    export default function Page() {
      useEffect(() => {}, [])
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasUseEffect).toBe(true)
})

it('detects useState usage', () => {
  const code = `
    import { useState } from 'react'
    export default function Page() {
      const [count, setCount] = useState(0)
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasUseState).toBe(true)
})

it('detects getStaticPaths (function declaration)', () => {
  const code = `
    export function getStaticPaths() {
      return []
    }
  `
  const result = detectRoutingStrategy(code, '/pages/[slug].tsx')
  expect(result.detectedFeatures.hasGetStaticPaths).toBe(true)
})

it('detects getStaticPaths (arrow function)', () => {
  const code = `
    export const getStaticPaths = () => {
      return []
    }
  `
  const result = detectRoutingStrategy(code, '/pages/[slug].tsx')
  expect(result.detectedFeatures.hasGetStaticPaths).toBe(true)
})

it('detects useLayoutEffect usage', () => {
  const code = `
    import { useLayoutEffect } from 'react'
    export default function Page() {
      useLayoutEffect(() => {}, [])
      return null
    }
  `
  const result = detectRoutingStrategy(code, '/app/page.tsx')
  expect(result.detectedFeatures.hasUseLayoutEffect).toBe(true)
})
