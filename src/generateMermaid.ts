import fs from "fs";

const ELK_RENDERER: string =
  "%%{init: {'flowchart': {'defaultRenderer': 'elk'}}}%%\n";

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
  let diagram = ELK_RENDERER + "graph TD\n";

  // TODO: Create builders for building each line of the chart instead of hardcoding strings
  moduleData.forEach((module) => {
    const moduleName = module.name;
    diagram += `  ${moduleName}\n`;

    module.imports.forEach((importedModule: any) => {
      diagram += `${importedModule} -->|imports| ${moduleName}\n`;
    });

    module.providers.forEach((provider: any) => {
      diagram += `  ${moduleName} -->|provides| ${provider}\n`;
    });

    module.controllers.forEach((controller: any) => {
      diagram += `  ${moduleName} -->|controls| ${controller}\n`;
    });

    module.exports.forEach((exp: any) => {
      diagram += `  ${moduleName} -->|exports| ${exp}\n`;
    });
  });

  // TODO: Future scope: Add option to set output filename
  fs.writeFileSync("output.mmd", diagram);
}
