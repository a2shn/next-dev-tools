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

export function detectRoutingStrategy(
  code: string,
  filePath: string,
): RoutingAnalysis {
  const ast = parse(code);

  const pathAnalysis = analyzePath(filePath);

  const features = createFeatures();

  traverseAst(ast, {
    Program(path) {
      const hasUseClient = path.node.directives.some((d) =>
        /^use client$/i.test(d.value.value.trim()),
      );

      if (hasUseClient) {
        features.isClientComponent = true;
      }
    },

    ExportNamedDeclaration(path) {
      const node = path.node.declaration;

      if (t.isFunctionDeclaration(node)) {
        const name = node.id?.name;
        if (name === 'getStaticProps') features.hasGetStaticProps = true;
        if (name === 'getServerSideProps')
          features.hasGetServerSideProps = true;
        if (name === 'getStaticPaths') features.hasGetStaticPaths = true;
        if (name === 'generateStaticParams')
          features.hasGenerateStaticParams = true;
        if (name === 'generateMetadata') features.hasGenerateMetadata = true;
      }

      if (t.isVariableDeclaration(node)) {
        for (const decl of node.declarations) {
          const name = decl.id.type === 'Identifier' ? decl.id.name : null;
          const init = decl.init;

          if (!name || !init) continue;

          if (
            t.isArrowFunctionExpression(init) ||
            t.isFunctionExpression(init)
          ) {
            if (name === 'getStaticProps') features.hasGetStaticProps = true;
            if (name === 'getServerSideProps')
              features.hasGetServerSideProps = true;
            if (name === 'getStaticPaths') features.hasGetStaticPaths = true;
            if (name === 'generateStaticParams')
              features.hasGenerateStaticParams = true;
            if (name === 'generateMetadata')
              features.hasGenerateMetadata = true;
          }
        }
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
    detectedFeatures: features,
    pathAnalysis,
  };
}
