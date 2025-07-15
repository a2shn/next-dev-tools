import * as t from '@babel/types';
import type { RoutingAnalysis } from '@next-dev-tools/shared/types';
import { analyzePath } from '../../lib/analyze-path';
import { analyzeVariable } from './analyze-variable';
import { analyzeObject } from './analyze-object';
import { analyzeFunction } from './analyze-function';
import { analyzeImports } from './analyze-imports';
import { determineStrategy } from './determine-strategy';
import { parse } from '../../lib/parse';
import { traverseAst } from '../../lib/traverse';
import { createFeatures } from './features';

export function detetRoutingStrategy(
  code: string,
  filePath: string,
): RoutingAnalysis {
  const ast = parse(code);

  const pathAnalysis = analyzePath(filePath);

  const features = createFeatures();

  traverseAst(ast, {
    Program: (path) => {
      const firstStatement = path.node.body[0];
      if (
        t.isExpressionStatement(firstStatement) &&
        t.isStringLiteral(firstStatement.expression) &&
        firstStatement.expression.value === 'use client'
      ) {
        features.isClientComponent = true;
      }
    },

    ExportNamedDeclaration: (path) => {
      if (t.isFunctionDeclaration(path.node.declaration)) {
        const name = path.node.declaration.id?.name;
        if (name === 'getStaticProps') features.hasGetStaticProps = true;
        if (name === 'getServerSideProps')
          features.hasGetServerSideProps = true;
        if (name === 'getStaticPaths') features.hasGetStaticPaths = true;
        if (name === 'generateStaticParams')
          features.hasGenerateStaticParams = true;
        if (name === 'generateMetadata') features.hasGenerateMetadata = true;
      }

      if (t.isVariableDeclaration(path.node.declaration)) {
        analyzeVariable(path.node.declaration, features);
      }
    },

    VariableDeclaration: (path) => {
      analyzeVariable(path.node, features);
    },

    ObjectExpression: (path) => {
      analyzeObject(path.node, features);
    },

    CallExpression: (path) => {
      analyzeFunction(path.node, features);
    },

    ImportDeclaration: (path) => {
      analyzeImports(path.node, features);
    },
  });

  const analysis = determineStrategy(features, pathAnalysis);

  return {
    strategy: analysis.strategy,
    rationale: analysis.rationale,
    dynamicSegments: pathAnalysis.dynamicSegments,
    routeType: pathAnalysis.routeType,
  };
}
