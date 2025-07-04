import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { HTTP_METHODS } from '@next-dev-tools/shared/constants';
import { httpMethod } from '@next-dev-tools/shared/types';

export async function detectAPIMethod(code: string): Promise<httpMethod[]> {
  const apiRouteMethods: httpMethod[] = [];

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const declaration = path.node.declaration;

      if (
        t.isFunctionDeclaration(declaration) &&
        t.isIdentifier(declaration.id)
      ) {
        if (HTTP_METHODS.includes(declaration.id.name as httpMethod)) {
          apiRouteMethods.push(declaration.id.name as httpMethod);
        }
      }

      if (t.isVariableDeclaration(declaration)) {
        declaration.declarations.forEach((decl) => {
          if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id)) {
            if (HTTP_METHODS.includes(decl.id.name as httpMethod)) {
              apiRouteMethods.push(decl.id.name as httpMethod);
            }
          }
        });
      }
    },
  });

  return apiRouteMethods;
}
