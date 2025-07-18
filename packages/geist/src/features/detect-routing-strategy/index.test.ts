import { expect, it } from 'vitest'
import { detectRoutingStrategy } from '.'

const cases = [
  {
    filePath: '/app/page.tsx',
    code: `
      import React from 'react'

      export async function getStaticProps() {
        const data = await fetch('https://api.example.com').then(res => res.json())
        return { props: { data } }
      }

      export default function HomePage({ data }: any) {
        return <div>{data}</div>
      }
    `,
    expected: 'SSG',
  },
  {
    filePath: '/app/page2.tsx',
    code: `
      import React from 'react'

      export async function getServerSideProps() {
        const user = await fetch('/api/user').then(res => res.json())
        return { props: { user } }
      }

      export default function UserPage({ user }: any) {
        return <div>{user.name}</div>
      }
    `,
    expected: 'SSR',
  },
  {
    filePath: '/app/page3.tsx',
    code: `
      import React from 'react'

      export async function getStaticProps() {
        return {
          props: { message: "Hello" },
          revalidate: 60
        }
      }

      export default function MessagePage({ message }: any) {
        return <p>{message}</p>
      }
    `,
    expected: 'ISR',
  },
  {
    filePath: '/app/page4.tsx',
    code: `
      import React from 'react'

      export function generateStaticParams() {
        return [{ slug: 'a' }, { slug: 'b' }]
      }

      export default function StaticParamsPage() {
        return <div>Params</div>
      }
    `,
    expected: 'SSG',
  },
  {
    filePath: '/app/[slug]/page.tsx',
    code: `
      import React from 'react'

      export default function SlugPage({ params }: { params: { slug: string } }) {
        return <div>{params.slug}</div>
      }
    `,
    expected: 'SSR',
  },
  {
    filePath: '/app/page5.tsx',
    code: `
      import React from 'react'

      const Page = () => {
        return <div>Static content</div>
      }

      export default Page
    `,
    expected: 'SSG',
  },
  {
    filePath: '/app/page6.tsx',
    code: `
      import React from 'react'

      export function generateMetadata() {
        return { title: 'Dynamic Title' }
      }

      export default function MetaPage() {
        return <div>Meta</div>
      }
    `,
    expected: 'SSR',
  },
  {
    filePath: '/app/page7.tsx',
    code: `
      'use client'
      import { useEffect, useState } from 'react'

      export default function ClientPage() {
        const [count, setCount] = useState(0)

        useEffect(() => {
          setCount(c => c + 1)
        }, [])

        return <div>{count}</div>
      }
    `,
    expected: 'SSG',
  },
] as const

it.each(cases)('$filePath -> $expected', ({ filePath, code, expected }) => {
  const result = detectRoutingStrategy(code, filePath)
  expect(result.strategy).toBe(expected)
})
