import fs from "fs";
import path from "path";
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { generateMermaidDiagram } from "./mermaid/generateMermaid";

const identifiedModules = {};
/**
 * Parent function that calls smaller functions responsible for walking the code, filtering modules
 * and generating mermaid diagram
 * @param projectPath
 * @param include
 * @param exclude
 */
export function analyzeProject(
  projectPath: string,
  outputFileName: string | "output.mmd",
  include?: string[] | undefined,
  exclude?: string[] | undefined
) {
  // Get project files
  const files = getAllFiles(projectPath, ".ts");

  // Filters teh modules to ignore files that are part of node_modules
  const modules = files.filter(
    (file) => file.endsWith(".module.ts") && !file.includes("node_modules")
  );

  const moduleData = modules.map((module) => analyzeModule(module));
  const filteredModuleData = filterModules(moduleData, include, exclude);

  // Generate mermaid diagram for the final module data
  generateMermaidDiagram(filteredModuleData, outputFileName);
}

/**
 * Function to recursively get information of all files with a specific extension in a directory
 * @param dir Directory to search in
 * @param ext Extension of files to search for (e.g., '.txt', '.js')
 * @param files Array to accumulate found file paths (used internally for recursion)
 * @returns Array of file paths with the specified extension
 */
function getAllFiles(dir: string, ext: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, ext, files);
    } else if (entry.isFile() && fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Filters a list of modules based on inclusion and exclusion criteria.
 *
 * @param moduleData - Array of module objects to be filtered. Each module should have a 'name' property.
 * @param include - Array of module names to be included. If undefined, all modules are included by default.
 * @param exclude - Array of module names to be excluded. If undefined, no modules are excluded by default.
 *
 * @returns The filtered array of module objects.
 */
function filterModules(
  moduleData: any[],
  include: string[] | undefined,
  exclude: string[] | undefined
) {
  if (include) {
    moduleData = moduleData.filter((module) => include.includes(module.name));
  }
  if (exclude) {
    moduleData = moduleData.filter((module) => !exclude.includes(module.name));
  }
  return moduleData;
}

/**
 * Analyzes a TypeScript module file to extract metadata about its structure.
 *
 * This function reads the content of the specified TypeScript file, parses it
 * to generate an abstract syntax tree (AST), and traverses the AST to extract
 * information about the module, including its name, imports, providers,
 * controllers, and exports.
 *
 * @param filePath - The path to the TypeScript file to be analyzed.
 * @returns An object containing the module's file path, name, imports, providers, controllers, and exports.
 */
function analyzeModule(filePath: string) {
  // Read the content of the specified file
  const content = fs.readFileSync(filePath, "utf8");

  // Parse the content to generate an AST
  // Ref. for AST: https://basarat.gitbook.io/typescript/overview/ast
  const ast = babelParser.parse(content, {
    sourceType: "module",
    plugins: ["typescript", "decorators-legacy", "classProperties"],
  });

  // Initialize an object to store module information
  const moduleInfo = {
    filePath,
    name: "",
    imports: [] as string[],
    providers: [] as string[],
    controllers: [] as string[],
    exports: [] as string[],
  };

  traverse(ast, {
    ClassDeclaration(path: NodePath<t.ClassDeclaration>) {
      extractModuleInfo(path, moduleInfo);
    },
  });

  return moduleInfo;
}

/**
 * Extracts module information from a class declaration node.
 *
 * @param path - The path of the class declaration node.
 * @param moduleInfo - The object to store the extracted module information.
 */
function extractModuleInfo(
  path: NodePath<t.ClassDeclaration>,
  moduleInfo: any
) {
  const className = path.node.id?.name;
  if (className) {
    // If a class name is found, set it as the module name for readability
    moduleInfo.name = className;
  }

  const decorators = path.node.decorators || [];
  decorators.forEach((decorator) => {
    if (
      t.isCallExpression(decorator.expression) &&
      t.isIdentifier(decorator.expression.callee) &&
      decorator.expression.callee.name === "Module"
    ) {
      // Check for the @Module decorator
      const moduleDecoratorArg = decorator.expression.arguments[0];
      if (t.isObjectExpression(moduleDecoratorArg)) {
        moduleDecoratorArg.properties.forEach((property) => {
          if (
            t.isObjectProperty(property) &&
            t.isIdentifier(property.key) &&
            t.isArrayExpression(property.value)
          ) {
            const elements = property.value.elements;
            const keyName = property.key.name;

            // Add elements to the corresponding arrays in moduleInfo
            elements.forEach((element) => {
              if (t.isIdentifier(element)) {
                switch (keyName) {
                  case "imports":
                    moduleInfo.imports.push(element.name);
                    break;
                  case "providers":
                    moduleInfo.providers.push(element.name);
                    break;
                  case "controllers":
                    moduleInfo.controllers.push(element.name);
                    break;
                  case "exports":
                    moduleInfo.exports.push(element.name);
                    break;
                }
              }
            });
          }
        });
      }
    }
  });
}
