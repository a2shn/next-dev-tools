import type { DetectedFeatures } from '@next-dev-tools/shared/types'
import * as t from '@babel/types'

export function analyzeVariable(
  node: t.VariableDeclaration,
  features: DetectedFeatures,
): void {
  node.declarations.forEach((decl) => {
    if (t.isIdentifier(decl.id)) {
      const name = decl.id.name

      if (name === 'revalidate') {
        features.hasRevalidate = true
        if (t.isNumericLiteral(decl.init)) {
          features.revalidateValue = decl.init.value
        }
        else if (t.isBooleanLiteral(decl.init)) {
          features.revalidateValue = decl.init.value
        }
      }

      if (name === 'runtime' && t.isStringLiteral(decl.init)) {
        features.runtime = decl.init.value
      }

      if (name === 'fetchCache' && t.isStringLiteral(decl.init)) {
        features.fetchCache = decl.init.value
      }

      if (name === 'dynamic' && t.isStringLiteral(decl.init)) {
        features.dynamic = decl.init.value
      }

      if (name === 'metadata') {
        features.hasMetadata = true
      }
    }
  })
}
