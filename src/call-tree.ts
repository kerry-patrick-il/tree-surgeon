import { FunctionDeclaration, ArrowFunction } from "ts-morph";
import {
  getFunctionCalls,
  getFunctionsFromSourceFile,
  getSourceTree,
} from "./source-tree";

const fileName = process.argv[2];
if (!fileName) {
  console.error("Please provide a filename as an argument.");
  process.exit(1);
}
const sourceFile = getSourceTree(fileName);
const functions = getFunctionsFromSourceFile(sourceFile);

console.log("\n\nFUNCTIONS\n", `Total functions: ${functions.size}\n`);

for (const [name] of functions) {
  console.log(name);
}

const diagram = buildMermaidCallGraph(functions);

console.log("\nMERMAID CHART\n");

console.log(diagram);

/// Helper functions

function buildMermaidCallGraph(
  functions: Map<string, { function: FunctionDeclaration | ArrowFunction }>
) {
  let header = "```mermaid\nflowchart TD\n";
  let bubbles = "";
  let edges = "";

  for (const [name, { function: func }] of functions) {
    bubbles += `${name}((${name}))\n`;

    const calls = getFunctionCalls(func);
    calls.forEach((call) => {
      if (functions.has(call)) {
        edges += `${name} --> ${call}\n`;
      }
    });
  }
  return header + bubbles + edges + "```";
}
