import traverse from '@babel/traverse'

export const traverseAst: typeof traverse
  = (traverse as any).default || traverse
