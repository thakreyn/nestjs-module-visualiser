import { Command } from "commander";
import { analyzeProject } from "./analyze";

const program = new Command();

// TODO: Restructure Commander app init
program
  .version("1.0.0")
  .description("NestJS Module Visualizer")
  .argument("<projectPath>", "Path to the NestJS project")
  .option(
    "-i, --include <modules>",
    "Comma-separated list of modules to include. Eg: Module1,Module2",
    (val) => val.split(",")
  )
  .option(
    "-e, --exclude <modules>",
    "Comma-separated list of modules to exclude. Eg: Module1,Module2",
    (val) => val.split(",")
  )
  .option("-o, --output <file>", "Name of the output file. Eg: mermaid.mmd")
  .action((projectPath, options) => {
    analyzeProject(
      projectPath,
      options.output,
      options.include,
      options.exclude
    );
  });

program.parse(process.argv);
