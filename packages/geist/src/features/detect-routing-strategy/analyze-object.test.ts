import { it, expect } from 'vitest';
import * as t from '@babel/types';
import { analyzeObject } from './analyze-object';
import { createFeatures } from './features';

it('detects numeric revalidate', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('revalidate'), t.numericLiteral(10)),
  ]);
  analyzeObject(obj, features);
  expect(features.hasRevalidate).toBe(true);
  expect(features.revalidateValue).toBe(10);
});

it('detects boolean revalidate', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('revalidate'), t.booleanLiteral(false)),
  ]);
  analyzeObject(obj, features);
  expect(features.hasRevalidate).toBe(true);
  expect(features.revalidateValue).toBe(false);
});

it('detects runtime', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('runtime'), t.stringLiteral('edge')),
  ]);
  analyzeObject(obj, features);
  expect(features.runtime).toBe('edge');
});

it('detects fetchCache', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(
      t.identifier('fetchCache'),
      t.stringLiteral('force-no-store'),
    ),
  ]);
  analyzeObject(obj, features);
  expect(features.fetchCache).toBe('force-no-store');
});

it('detects dynamic', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('dynamic'), t.stringLiteral('force-dynamic')),
  ]);
  analyzeObject(obj, features);
  expect(features.dynamic).toBe('force-dynamic');
});

it('detects cache: no-store', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('cache'), t.stringLiteral('no-store')),
  ]);
  analyzeObject(obj, features);
  expect(features.hasFetchWithNoStore).toBe(true);
});

it('detects cache: force-cache', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('cache'), t.stringLiteral('force-cache')),
  ]);
  analyzeObject(obj, features);
  expect(features.hasFetchWithForceCache).toBe(true);
});

it('recursively analyzes next object', () => {
  const features = createFeatures();
  const inner = t.objectExpression([
    t.objectProperty(t.identifier('revalidate'), t.numericLiteral(30)),
  ]);
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('next'), inner),
  ]);
  analyzeObject(obj, features);
  expect(features.hasRevalidate).toBe(true);
  expect(features.revalidateValue).toBe(30);
});

it('ignores unrelated keys', () => {
  const features = createFeatures();
  const obj = t.objectExpression([
    t.objectProperty(t.identifier('other'), t.stringLiteral('x')),
  ]);
  analyzeObject(obj, features);
  expect(
    Object.values(features).some((v) => v !== undefined && v !== false),
  ).toBe(false);
});
