import * as parser from '@babel/parser';
import type { File } from '@babel/types';

export function parse(code: string): parser.ParseResult<File> {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties',
      'objectRestSpread',
      'asyncGenerators',
      'functionBind',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining',
    ],
  });
}
