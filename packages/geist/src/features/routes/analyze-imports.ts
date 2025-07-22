import type { DetectedFeatures } from '@next-dev-tools/shared/types'
import * as t from '@babel/types'

export function analyzeImports(
  node: t.ImportDeclaration,
  features: DetectedFeatures,
): void {
  const source = node.source.value

  if (source === 'next/headers' || source === 'next/cookies') {
    node.specifiers.forEach((spec) => {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        const name = spec.imported.name
        if (name === 'cookies')
          features.usesCookies = true
        if (name === 'headers')
          features.usesHeaders = true
      }
    })
  }

  if (source === 'next/navigation') {
    node.specifiers.forEach((spec) => {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        const name = spec.imported.name
        if (name === 'notFound')
          features.usesNotFound = true
        if (name === 'redirect')
          features.usesRedirect = true
        if (name === 'useSearchParams')
          features.usesSearchParams = true
      }
    })
  }
}
