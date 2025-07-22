import type { DetectedFeatures } from '@next-dev-tools/shared/types'
import * as t from '@babel/types'
import { analyzeObject } from './analyze-object'

export function analyzeFunction(
  node: t.CallExpression,
  features: DetectedFeatures,
): void {
  if (t.isIdentifier(node.callee)) {
    const name = node.callee.name
    if (name === 'useLayoutEffect')
      features.hasUseLayoutEffect = true
    if (name === 'useEffect')
      features.hasUseEffect = true
    if (name === 'useState')
      features.hasUseState = true
    if (name === 'cookies')
      features.usesCookies = true
    if (name === 'headers')
      features.usesHeaders = true
    if (name === 'notFound')
      features.usesNotFound = true
    if (name === 'redirect')
      features.usesRedirect = true
    if (name === 'unstable_cache')
      features.usesUnstableCache = true

    if (name === 'fetch') {
      analyzeFetchCall(node, features)
    }
  }

  if (t.isMemberExpression(node.callee)) {
    if (
      t.isIdentifier(node.callee.object)
      && t.isIdentifier(node.callee.property)
    ) {
      const obj = node.callee.object.name

      if (obj === 'unstable_cache') {
        features.usesUnstableCache = true
      }
    }
  }
}

export function analyzeFetchCall(
  node: t.CallExpression,
  features: DetectedFeatures,
): void {
  if (node.arguments.length > 1) {
    const options = node.arguments[1]
    if (t.isObjectExpression(options)) {
      analyzeObject(options, features)
    }
  }
}
