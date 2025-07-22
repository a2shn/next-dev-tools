import type { DetectedFeatures } from '@next-dev-tools/shared/types'
import * as t from '@babel/types'

export function analyzeObject(
  node: t.ObjectExpression,
  features: DetectedFeatures,
): void {
  node.properties.forEach((prop) => {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name

      if (key === 'revalidate') {
        features.hasRevalidate = true
        if (t.isNumericLiteral(prop.value)) {
          features.revalidateValue = prop.value.value
        }
        else if (t.isBooleanLiteral(prop.value)) {
          features.revalidateValue = prop.value.value
        }
      }

      if (key === 'runtime' && t.isStringLiteral(prop.value)) {
        features.runtime = prop.value.value
      }

      if (key === 'fetchCache' && t.isStringLiteral(prop.value)) {
        features.fetchCache = prop.value.value
      }

      if (key === 'dynamic' && t.isStringLiteral(prop.value)) {
        features.dynamic = prop.value.value
      }

      if (key === 'cache' && t.isStringLiteral(prop.value)) {
        if (prop.value.value === 'no-store') {
          features.hasFetchWithNoStore = true
        }
        else if (prop.value.value === 'force-cache') {
          features.hasFetchWithForceCache = true
        }
      }

      if (key === 'next' && t.isObjectExpression(prop.value)) {
        analyzeObject(prop.value, features)
      }
    }
  })
}
