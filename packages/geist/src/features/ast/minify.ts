import { generate } from "@babel/generator"
import { parse } from "../../lib/parse"

export function minify(code: string) {
  const ast = parse(code)

  return generate(ast, {
    minified: true,
    comments: false,
    concise: true
  }).code
}
