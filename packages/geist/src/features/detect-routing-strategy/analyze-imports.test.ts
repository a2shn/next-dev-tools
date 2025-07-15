import { it, expect } from 'vitest';
import * as t from '@babel/types';
import { analyzeImports } from './analyze-imports';
import { createFeatures } from './features';

it('detects cookies and headers from next/headers and next/cookies', () => {
  const features = createFeatures();
  const node = t.importDeclaration(
    [
      t.importSpecifier(t.identifier('cookies'), t.identifier('cookies')),
      t.importSpecifier(t.identifier('headers'), t.identifier('headers')),
    ],
    t.stringLiteral('next/headers'),
  );
  analyzeImports(node, features);
  expect(features.usesCookies).toBe(true);
  expect(features.usesHeaders).toBe(true);
});

it('detects only cookies from next/cookies', () => {
  const features = createFeatures();
  const node = t.importDeclaration(
    [t.importSpecifier(t.identifier('cookies'), t.identifier('cookies'))],
    t.stringLiteral('next/cookies'),
  );
  analyzeImports(node, features);
  expect(features.usesCookies).toBe(true);
  expect(features.usesHeaders).toBe(false);
});

it('detects notFound and redirect from next/navigation', () => {
  const features = createFeatures();
  const node = t.importDeclaration(
    [
      t.importSpecifier(t.identifier('notFound'), t.identifier('notFound')),
      t.importSpecifier(t.identifier('redirect'), t.identifier('redirect')),
    ],
    t.stringLiteral('next/navigation'),
  );
  analyzeImports(node, features);
  expect(features.usesNotFound).toBe(true);
  expect(features.usesRedirect).toBe(true);
});

it('ignores unrelated specifiers from next/navigation', () => {
  const features = createFeatures();
  const node = t.importDeclaration(
    [t.importSpecifier(t.identifier('Link'), t.identifier('Link'))],
    t.stringLiteral('next/navigation'),
  );
  analyzeImports(node, features);
  expect(Object.values(features).some((v) => v)).toBe(false);
});

it('ignores irrelevant imports', () => {
  const features = createFeatures();
  const node = t.importDeclaration(
    [t.importSpecifier(t.identifier('x'), t.identifier('x'))],
    t.stringLiteral('react'),
  );
  analyzeImports(node, features);
  expect(Object.values(features).some((v) => v)).toBe(false);
});
