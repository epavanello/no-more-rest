import arg from "arg";
import inquirer, { QuestionCollection } from "inquirer";
import { Parser } from "acorn";
import * as path from "path";
import fs from "fs";

export interface Options {
  input?: string;
  outputDir?: string;
  address?: string;
  filename?: string;
  typescriptOutput: boolean;
  watch: boolean;
}

function parseArgumentsIntoOptions(rawArgs: string[]): Options {
  const args = arg(
    {
      "--input": String,
      "--output-dir": String,
      "--address": String,
      "--typescript-output": Boolean,
      "--filename": String,
      "--watch": Boolean,
      "-i": "--input",
      "-o": "--output-dir",
      "-a": "--address",
      "-t": "--typescript-output",
      "-f": "--filename",
      "-w": "--watch",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    input: args["--input"],
    outputDir: args["--output-dir"],
    address: args["--address"],
    typescriptOutput: args["--typescript-output"] || false,
    filename: args["--filename"],
    watch: args["--watch"] || false, // WIP
  };
}

async function promptForMissingOptions(options: Options): Promise<Options> {
  const questions: QuestionCollection[] = [];
  if (!options.input) {
    questions.push({
      type: "input",
      name: "input",
      message: "Please choose the file that exposes the functions",
    });
  }
  if (!options.outputDir) {
    questions.push({
      type: "input",
      name: "outputDir",
      message: "Please choose the destination folder",
    });
  }
  if (!options.address) {
    questions.push({
      type: "input",
      name: "address",
      message: "Please specify the address of your servr",
      default: "http://localhost:8000",
    });
  }
  if (typeof options.typescriptOutput == "undefined") {
    questions.push({
      type: "confirm",
      name: "typescriptOutput",
      message: "Do you want a Typescript output?",
    });
  }
  if (!options.filename) {
    questions.push({
      type: "input",
      name: "filename",
      message: "Which filename do you want to generate?",
      default: "generatedProxy",
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    input: options.input || answers.input,
    outputDir: options.outputDir || answers.outputDir,
    typescriptOutput: options.typescriptOutput || answers.typescriptOutput,
    filename: options.filename || answers.filename,
    address: options.address || answers.address,
  };
}

export async function cli(args: string[]) {
  let options = parseArgumentsIntoOptions(args);
  if (
    args.length == 2 ||
    !options.input ||
    !options.outputDir ||
    !options.address
  ) {
    options = await promptForMissingOptions(options);
  }

  console.log("Started generation with options", options);

  generate(options, args[1]);
  if (options.watch) {
    fs.watchFile(options.input!, () => {
      console.log("Change detected");
      generate(options, args[1]);
    });
  }
}

export function generate(options: Options, binPath: string) {
  let generated = fs
    .readFileSync(
      path.join(
        path.dirname(binPath),
        "..",
        ...(options.typescriptOutput
          ? ["src", "proxy.ts"]
          : ["dist", "proxy.js"])
      )
    )
    .toString();

  const ast = Parser.parse(fs.readFileSync(options.input!).toString(), {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  const body = (ast as any).body;

  for (const item of body) {
    if (item.type == "ExportNamedDeclaration") {
      const functionName = item.declaration.id.name;
      const params = item.declaration.params.map((p: any) => p.name);
      generated += `
export function ${functionName}(${params.join(", ")}) {
  return proxy('${options.address}','${functionName}', arguments);
}
`;
    }
  }
  const outputFile = path.join(
    options.outputDir!,
    (options.filename || "generatedProxy") +
      (options.typescriptOutput ? ".ts" : ".js")
  );
  fs.writeFileSync(outputFile, generated);

  console.log(`File ${outputFile} created`);
}
