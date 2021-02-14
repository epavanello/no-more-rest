import arg from "arg";
import inquirer from "inquirer";
import { Parser } from "acorn";
import * as path from "path";

export interface Options {
  input?: string;
  outputDir?: string;
  typescriptOutput?: boolean;
}

function parseArgumentsIntoOptions(rawArgs: string[]): Options {
  const args = arg(
    {
      "--input": String,
      "--output-dir": String,
      "--typescript-output": Boolean,
      "-i": "--input",
      "-o": "--output-dir",
      "-to": "--typescript-output",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    input: args["--input"],
    outputDir: args["--output-dir"],
    typescriptOutput: args["--typescript-output"],
  };
}

async function promptForMissingOptions(options: Options): Promise<Options> {
  const questions = [];
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
      message: "Please Choose the destination folder",
    });
  }
  if (!options.typescriptOutput) {
    questions.push({
      type: "confirm",
      name: "typescriptOutput",
      message: "Do you want a Typescript output?",
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    input: options.input || answers.input,
    outputDir: options.outputDir || answers.outputDir,
    typescriptOutput: options.typescriptOutput || answers.typescriptOutput,
  };
}

export async function cli(args: string[]) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  console.log("args", args);
  generate(options, args[1]);
}

export function generate(options: Options, binPath: string) {
  var fs = require("fs");

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

  const ast = Parser.parse(fs.readFileSync(options.input).toString(), {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  const body = (ast as any).body;

  for (const item of body) {
    if (item.type == "ExportNamedDeclaration") {
      const functionName = item.declaration.id.name;
      const params = item.declaration.params.map((p: any) => p.name);
      generated += `export function ${functionName}(${params.join(", ")}) {
  return proxy('${functionName}', arguments);
}
`;
    }
  }
  fs.writeFileSync(
    path.join(
      options.outputDir!,
      "generated" + options.typescriptOutput ? ".ts" : ".js"
    ),
    generated
  );
}
