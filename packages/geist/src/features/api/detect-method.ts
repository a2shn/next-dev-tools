import type { httpMethod } from '@next-dev-tools/shared/types'
import * as t from '@babel/types'
import { HTTP_METHODS } from '@next-dev-tools/shared/constants'
import { parse } from '../../lib/parse'
import { traverseAst } from '../../lib/traverse'

export async function detectAPIMethod(code: string): Promise<httpMethod[]> {
  const apiRouteMethods: Set<httpMethod> = new Set()
  const declaredIdentifiers = new Map<
    string,
    t.FunctionDeclaration | t.VariableDeclarator
  >()

  const ast = parse(code)

  traverseAst(ast, {
    FunctionDeclaration(path) {
      if (t.isIdentifier(path.node.id)) {
        declaredIdentifiers.set(path.node.id.name, path.node)
      }
    },
    VariableDeclarator(path) {
      if (t.isIdentifier(path.node.id)) {
        declaredIdentifiers.set(path.node.id.name, path.node)
      }
    },
    ExportNamedDeclaration(path) {
      const { declaration, specifiers } = path.node

      if (declaration) {
        if (
          t.isFunctionDeclaration(declaration)
          && t.isIdentifier(declaration.id)
        ) {
          const name = declaration.id.name
          if (HTTP_METHODS.includes(name as httpMethod)) {
            apiRouteMethods.add(name as httpMethod)
          }
        }

        if (t.isVariableDeclaration(declaration)) {
          for (const decl of declaration.declarations) {
            if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id)) {
              const name = decl.id.name
              if (HTTP_METHODS.includes(name as httpMethod)) {
                apiRouteMethods.add(name as httpMethod)
              }
            }
          }
        }
      }

      for (const specifier of specifiers) {
        if (
          t.isExportSpecifier(specifier)
          && t.isIdentifier(specifier.exported)
          && t.isIdentifier(specifier.local)
        ) {
          const name = specifier.exported.name
          if (HTTP_METHODS.includes(name as httpMethod)) {
            apiRouteMethods.add(name as httpMethod)
          }
        }
      }
    },
  })

  return Array.from(apiRouteMethods)
}
