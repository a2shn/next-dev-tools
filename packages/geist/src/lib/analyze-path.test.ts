import { expect, it } from 'vitest'
import { analyzePath } from './analyze-path'

it('detects app/page static', () => {
  const result = analyzePath('/app/home/page.tsx')
  expect(result.isAppRouter).toBe(true)
  expect(result.routeType).toBe('page')
  expect(result.isDynamic).toBe(false)
  expect(result.dynamicSegments).toEqual([])
})

it('detects app/page dynamic', () => {
  const result = analyzePath('/app/products/[id]/page.tsx')
  expect(result.isAppRouter).toBe(true)
  expect(result.routeType).toBe('page')
  expect(result.isDynamic).toBe(true)
  expect(result.dynamicSegments.map(d => d.segment)).toEqual(['id'])
})

it('detects app/layout static', () => {
  const result = analyzePath('/app/dashboard/layout.tsx')
  expect(result.isAppRouter).toBe(true)
  expect(result.routeType).toBe('layout')
  expect(result.isDynamic).toBe(false)
})

it('detects app/layout dynamic', () => {
  const result = analyzePath('/app/blog/[tag]/layout.tsx')
  expect(result.routeType).toBe('layout')
  expect(result.dynamicSegments.map(d => d.segment)).toEqual(['tag'])
  expect(result.isDynamic).toBe(true)
})

it('detects app/api route', () => {
  const result = analyzePath('/app/api/posts/route.ts')
  expect(result.routeType).toBe('api')
  expect(result.isAppRouter).toBe(true)
  expect(result.isDynamic).toBe(false)
})

it('detects pages/api route static', () => {
  const result = analyzePath('/pages/api/hello.ts')
  expect(result.isPagesRouter).toBe(true)
  expect(result.routeType).toBe('api')
})

it('detects pages/api route dynamic', () => {
  const result = analyzePath('/pages/api/users/[id].ts')
  expect(result.routeType).toBe('api')
  expect(result.dynamicSegments.map(d => d.segment)).toEqual(['id'])
  expect(result.isDynamic).toBe(true)
})

it('detects pages route static', () => {
  const result = analyzePath('/pages/about.tsx')
  expect(result.isPagesRouter).toBe(true)
  expect(result.routeType).toBe('page')
  expect(result.isDynamic).toBe(false)
})

it('detects pages route dynamic', () => {
  const result = analyzePath('/pages/blog/[slug].tsx')
  expect(result.routeType).toBe('page')
  expect(result.dynamicSegments.map(d => d.segment)).toEqual(['slug'])
})

it('detects middleware at root', () => {
  const result = analyzePath('/middleware.ts')
  expect(result.routeType).toBe('middleware')
  expect(result.isAppRouter).toBe(false)
})

it('detects deeply nested optional catch-all', () => {
  const result = analyzePath('/app/[[...slug]]/page.tsx')
  expect(
    result.dynamicSegments.map(d =>
      d.optional ? `...${d.segment}?` : `...${d.segment}`,
    ),
  ).toEqual(['...slug?'])
  expect(result.isDynamic).toBe(true)
})

it('detects deeply nested catch-all', () => {
  const result = analyzePath('/pages/blog/[...params].tsx')
  expect(result.dynamicSegments.map(d => `...${d.segment}`)).toEqual([
    '...params',
  ])
  expect(result.isDynamic).toBe(true)
})

it('detects deeply nested mix of dynamic types', () => {
  const result = analyzePath('/app/[[...lang]]/[category]/[...slug]/page.tsx')
  expect(
    result.dynamicSegments.map((d) => {
      if (d.catchAll)
        return d.optional ? `...${d.segment}?` : `...${d.segment}`
      return d.segment
    }),
  ).toEqual(['...lang?', 'category', '...slug'])
  expect(result.isDynamic).toBe(true)
})

it('handles edge: no extension but matches layout', () => {
  const result = analyzePath('/app/team/layout')
  expect(result.routeType).toBe('layout')
})

it('handles edge: dynamic segment with dots', () => {
  const result = analyzePath('/app/blog/[...author.posts]/page.tsx')
  expect(result.dynamicSegments.map(d => `...${d.segment}`)).toEqual([
    '...author.posts',
  ])
})

it('handles mixed casing or folder typos', () => {
  const result = analyzePath('/APP/BLOG/page.tsx')
  expect(result.routeType).toBe('unknown')
})

it('handles non-route random file', () => {
  const result = analyzePath('/scripts/dev.ts')
  expect(result.routeType).toBe('unknown')
  expect(result.isAppRouter).toBe(false)
  expect(result.isPagesRouter).toBe(false)
  expect(result.isDynamic).toBe(false)
  expect(result.dynamicSegments).toEqual([])
})

it('normalizes backslashes on windows path', () => {
  const result = analyzePath('C:\\project\\app\\products\\[id]\\page.tsx')
  expect(result.isAppRouter).toBe(true)
  expect(result.routeType).toBe('page')
  expect(result.dynamicSegments.map(d => d.segment)).toEqual(['id'])
})
