import * as t from '@babel/types'
import { expect, it } from 'vitest'
import { analyzeVariable } from './analyze-variable'
import { createFeatures } from './features'

it('detects numeric revalidate variable', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('revalidate'), t.numericLiteral(60)),
  ])
  analyzeVariable(node, features)
  expect(features.hasRevalidate).toBe(true)
  expect(features.revalidateValue).toBe(60)
})

it('detects boolean revalidate variable', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('revalidate'), t.booleanLiteral(true)),
  ])
  analyzeVariable(node, features)
  expect(features.hasRevalidate).toBe(true)
  expect(features.revalidateValue).toBe(true)
})

it('detects runtime variable', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('runtime'), t.stringLiteral('edge')),
  ])
  analyzeVariable(node, features)
  expect(features.runtime).toBe('edge')
})

it('detects fetchCache variable', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('fetchCache'),
      t.stringLiteral('default'),
    ),
  ])
  analyzeVariable(node, features)
  expect(features.fetchCache).toBe('default')
})

it('detects dynamic variable', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('dynamic'),
      t.stringLiteral('force-dynamic'),
    ),
  ])
  analyzeVariable(node, features)
  expect(features.dynamic).toBe('force-dynamic')
})

it('detects metadata variable presence', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('metadata'), t.objectExpression([])),
  ])
  analyzeVariable(node, features)
  expect(features.hasMetadata).toBe(true)
})

it('ignores unrelated variable names', () => {
  const features = createFeatures()
  const node = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('notRelevant'), t.stringLiteral('abc')),
  ])
  analyzeVariable(node, features)
  expect(
    Object.values(features).some(v => v !== false && v !== undefined),
  ).toBe(false)
})
