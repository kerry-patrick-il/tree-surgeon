import {
  ArrowFunction,
  FunctionDeclaration,
  Identifier,
  Project,
  SourceFile,
} from "ts-morph";
import * as ts from "typescript";

export function getSourceTree(fileName: string) {
  const project = new Project();
  project.addSourceFileAtPath(fileName);
  const sourceFile = project.createSourceFile(
    "temp.ts",
    ts.sys.readFile(fileName) || ""
  );
  return sourceFile;
}

export function getFunctionsFromSourceFile(
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

export function getFunctionCalls(
  func: FunctionDeclaration | ArrowFunction
): string[] {
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
