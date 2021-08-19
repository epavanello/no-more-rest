import arg from 'arg'
import inquirer, { QuestionCollection } from 'inquirer'
import fs from 'fs'
import Options from './cli-options'
import { generate } from './generator'

function parseArgumentsIntoOptions(rawArgs: string[]): Options {
  const args = arg(
    {
      '--input': String,
      '--output-dir': String,
      '--address': String,
      '--typescript-output': Boolean,
      '--filename': String,
      '--watch': Boolean,
      '--version': Boolean,
      '-i': '--input',
      '-o': '--output-dir',
      '-a': '--address',
      '-t': '--typescript-output',
      '-f': '--filename',
      '-w': '--watch',
      '-v': '--version',
    },
    {
      argv: rawArgs.slice(2),
    }
  )
  return {
    input: args['--input'],
    outputDir: args['--output-dir'],
    address: args['--address'],
    typescriptOutput: args['--typescript-output'] || false,
    filename: args['--filename'],
    watch: args['--watch'] || false, // WIP,
    version: args['--version'] || false,
  }
}

async function promptForMissingOptions(options: Options): Promise<Options> {
  const questions: QuestionCollection[] = []
  if (!options.input) {
    questions.push({
      type: 'input',
      name: 'input',
      message: 'Please choose the file that exposes the functions',
    })
  }
  if (!options.outputDir) {
    questions.push({
      type: 'input',
      name: 'outputDir',
      message: 'Please choose the destination folder',
    })
  }
  if (!options.address) {
    questions.push({
      type: 'input',
      name: 'address',
      message: 'Please specify the address of your server',
      default: 'http://localhost:8000',
    })
  }
  if (typeof options.typescriptOutput == 'undefined') {
    questions.push({
      type: 'confirm',
      name: 'typescriptOutput',
      message: 'Do you want a Typescript output?',
    })
  }
  if (!options.filename) {
    questions.push({
      type: 'input',
      name: 'filename',
      message: 'Which filename do you want to generate?',
      default: 'generatedProxy',
    })
  }

  const answers = await inquirer.prompt(questions)
  return {
    ...options,
    input: options.input || answers.input,
    outputDir: options.outputDir || answers.outputDir,
    typescriptOutput: options.typescriptOutput || answers.typescriptOutput,
    filename: options.filename || answers.filename,
    address: options.address || answers.address,
  }
}

export async function cli(args: string[]) {
  let options = parseArgumentsIntoOptions(args)
  if (options.version) {
    var pkg = require('../package.json')
    console.log('NO MORE REST v.' + pkg.version)
    return
  }
  if (args.length == 2 || !options.input || !options.outputDir || !options.address) {
    options = await promptForMissingOptions(options)
  }

  console.log('Started generation with options', options)

  generate(options, args[1])
  if (options.watch) {
    fs.watchFile(options.input!, () => {
      console.log('Change detected')
      generate(options, args[1])
    })
  }
}
