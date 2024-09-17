import {
  Project,
  FunctionDeclaration,
  SourceFile,
  ArrowFunction,
  Identifier,
} from "ts-morph";
import * as ts from "typescript";

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

function getSourceTree(fileName: string) {
  const project = new Project();
  project.addSourceFileAtPath(fileName);
  const sourceFile = project.createSourceFile(
    "temp.ts",
    ts.sys.readFile(fileName) || ""
  );
  return sourceFile;
}

function getFunctionsFromSourceFile(
  sourceFile: SourceFile
): Map<string, { function: FunctionDeclaration | ArrowFunction }> {
  const functions = new Map<
    string,
    { function: FunctionDeclaration | ArrowFunction }
  >();
  sourceFile.forEachDescendant((node) => {
    if (node.getKindName() === "FunctionDeclaration") {
      const functionNode = node as FunctionDeclaration;
      functions.set(functionNode.getName() ?? "no name", {
        function: functionNode,
      });
    }

    if (node.getKindName() === "VariableDeclaration") {
      if (
        node.getChildrenOfKind(ts.SyntaxKind.ArrowFunction).length > 0 &&
        node.getChildrenOfKind(ts.SyntaxKind.Identifier).length > 0
      ) {
        const identifier = node.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
        const arrow = node.getChildrenOfKind(ts.SyntaxKind.ArrowFunction)[0];
        functions.set(identifier.getText(), {
          function: arrow as ArrowFunction,
        });
      }
    }
  });
  return functions;
}

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

function getFunctionCalls(func: FunctionDeclaration | ArrowFunction): string[] {
  const calls: string[] = [];
  func.forEachDescendant((node) => {
    if (
      node.getKindName() === "CallExpression" &&
      node.getFirstChildByKind(ts.SyntaxKind.Identifier)
    ) {
      const call = node.getFirstChildByKind(
        ts.SyntaxKind.Identifier
      ) as Identifier;
      calls.push(call.getText());
    }
  });
  return calls;
}
