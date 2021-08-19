import { Parser } from 'acorn'
import fs from 'fs'
import path from 'path'
import Options from './cli-options'

export function generate(options: Options, binPath: string) {
  let generated = fs
    .readFileSync(
      path.join(path.dirname(binPath), '..', ...(options.typescriptOutput ? ['src', 'proxy.ts'] : ['dist', 'proxy.js']))
    )
    .toString()

  const ast = Parser.parse(fs.readFileSync(options.input!).toString(), {
    sourceType: 'module',
    ecmaVersion: 'latest',
  })

  const body = (ast as any).body

  for (const item of body) {
    if (item.type == 'ExportNamedDeclaration') {
      const functionName = item.declaration.id.name
      const params = item.declaration.params.map((p: any) => p.name)
      generated += `
  export function ${functionName}(${params.join(', ')}) {
    return proxy('${options.address}','${functionName}', arguments);
  }
  `
    }
  }
  const outputFile = path.join(
    options.outputDir!,
    (options.filename || 'generatedProxy') + (options.typescriptOutput ? '.ts' : '.js')
  )
  fs.writeFileSync(outputFile, generated)

  console.log(`File ${outputFile} created`)
}
