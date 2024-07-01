import { ELK_RENDERER_INIT, TOP_DOWN_FLOWCHART_INIT } from "./constants";

export class DiagramBuilder {
  private diagram: string;

  constructor() {
    this.diagram = ELK_RENDERER_INIT + TOP_DOWN_FLOWCHART_INIT;
  }

  addModule(moduleName: string): void {
    this.diagram += `  ${moduleName}\n`;
  }

  addImport(moduleName: string, importedModule: string): void {
    this.diagram += `  ${importedModule} -->|imports| ${moduleName}\n`;
  }

  addProvider(moduleName: string, provider: string): void {
    this.diagram += `  ${moduleName} -->|provides| ${provider}\n`;
  }

  addController(moduleName: string, controller: string): void {
    this.diagram += `  ${moduleName} -->|controls| ${controller}\n`;
  }

  addExport(moduleName: string, exp: string): void {
    this.diagram += `  ${moduleName} -->|exports| ${exp}\n`;
  }

  build(): string {
    return this.diagram;
  }
}
