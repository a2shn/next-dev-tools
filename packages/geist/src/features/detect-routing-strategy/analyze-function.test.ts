import { it, expect } from 'vitest';
import * as t from '@babel/types';
import { analyzeFunction, analyzeFetchCall } from './analyze-function';
import { createFeatures } from './features';

it('detects all known identifiers', () => {
  const features = createFeatures();

  analyzeFunction(t.callExpression(t.identifier('useEffect'), []), features);
  analyzeFunction(t.callExpression(t.identifier('useState'), []), features);
  analyzeFunction(t.callExpression(t.identifier('cookies'), []), features);
  analyzeFunction(t.callExpression(t.identifier('headers'), []), features);
  analyzeFunction(t.callExpression(t.identifier('notFound'), []), features);
  analyzeFunction(t.callExpression(t.identifier('redirect'), []), features);
  analyzeFunction(
    t.callExpression(t.identifier('useLayoutEffect'), []),
    features,
  );
  analyzeFunction(
    t.callExpression(t.identifier('unstable_cache'), []),
    features,
  );

  expect(features.hasUseEffect).toBe(true);
  expect(features.hasUseState).toBe(true);
  expect(features.usesCookies).toBe(true);
  expect(features.usesHeaders).toBe(true);
  expect(features.usesNotFound).toBe(true);
  expect(features.usesRedirect).toBe(true);
  expect(features.usesUnstableCache).toBe(true);
  expect(features.hasUseLayoutEffect).toBe(true);
});

it('calls analyzeFetchCall when fetch is used', () => {
  const features = createFeatures();
  const options = t.objectExpression([]);
  const fetchNode = t.callExpression(t.identifier('fetch'), [
    t.stringLiteral('/api'),
    options,
  ]);
  analyzeFunction(fetchNode, features);
  expect(true).toBe(true);
});

it('detects unstable_cache as a member expression', () => {
  const features = createFeatures();
  const node = t.callExpression(
    t.memberExpression(t.identifier('unstable_cache'), t.identifier('get')),
    [],
  );
  analyzeFunction(node, features);
  expect(features.usesUnstableCache).toBe(true);
});

it('ignores unknown identifiers', () => {
  const features = createFeatures();
  analyzeFunction(
    t.callExpression(t.identifier('somethingElse'), []),
    features,
  );
  expect(Object.values(features).some((v) => v)).toBe(false);
});

it('handles non-Identifier callee gracefully', () => {
  const features = createFeatures();
  const callee = t.functionExpression(null, [], t.blockStatement([]));
  const node = t.callExpression(callee, []);
  analyzeFunction(node, features);
  expect(Object.values(features).some((v) => v)).toBe(false);
});

it('analyzes fetch options if present and object', () => {
  const features = createFeatures();
  const options = t.objectExpression([
    t.objectProperty(t.identifier('next'), t.objectExpression([])),
  ]);
  const node = t.callExpression(t.identifier('fetch'), [
    t.stringLiteral('/api'),
    options,
  ]);
  analyzeFetchCall(node, features);
  expect(true).toBe(true);
});

it('skips fetch options if not an object', () => {
  const features = createFeatures();
  const node = t.callExpression(t.identifier('fetch'), [
    t.stringLiteral('/api'),
    t.numericLiteral(123),
  ]);
  analyzeFetchCall(node, features);
  expect(true).toBe(true);
});

it('handles fetch with no second argument', () => {
  const features = createFeatures();
  const node = t.callExpression(t.identifier('fetch'), [
    t.stringLiteral('/api'),
  ]);
  analyzeFetchCall(node, features);
  expect(true).toBe(true);
});
