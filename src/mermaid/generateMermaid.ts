import fs from "fs";
import { DiagramBuilder } from "./DiagramBuilder";

/**
 * Generates a Mermaid diagram representation of module dependencies and writes it to a file.
 *
 * This function takes an array of module data objects and generates a Mermaid
 * diagram in the 'graph TD' format, which illustrates the relationships between
 * modules, including imports, providers, controllers, and exports. The generated
 * diagram is then written to an 'output.mmd' file.
 *
 * @param moduleData
 */
export function generateMermaidDiagram(moduleData: any[]) {
  let diagramBuilder = new DiagramBuilder();

  moduleData.forEach((module) => {
    const moduleName = module.name;
    diagramBuilder.addModule(moduleName);

    module.imports.forEach((importedModule: any) => {
      diagramBuilder.addImport(moduleName, importedModule);
    });

    module.providers.forEach((provider: any) => {
      diagramBuilder.addProvider(moduleName, provider);
    });

    module.controllers.forEach((controller: any) => {
      diagramBuilder.addController(moduleName, controller);
    });

    module.exports.forEach((exports: any) => {
      diagramBuilder.addExport(moduleName, exports);
    });
  });

  // TODO: Future scope: Add option to set output filename
  fs.writeFileSync("output.mmd", diagramBuilder.build());
}
