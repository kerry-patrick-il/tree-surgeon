"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const ts = __importStar(require("typescript"));
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
function getSourceTree(fileName) {
    const project = new ts_morph_1.Project();
    project.addSourceFileAtPath(fileName);
    const sourceFile = project.createSourceFile("temp.ts", ts.sys.readFile(fileName) || "");
    return sourceFile;
}
function getFunctionsFromSourceFile(sourceFile) {
    const functions = new Map();
    sourceFile.forEachDescendant((node) => {
        var _a;
        if (node.getKindName() === "FunctionDeclaration") {
            const functionNode = node;
            functions.set((_a = functionNode.getName()) !== null && _a !== void 0 ? _a : "no name", {
                function: functionNode,
            });
        }
        if (node.getKindName() === "VariableDeclaration") {
            if (node.getChildrenOfKind(ts.SyntaxKind.ArrowFunction).length > 0 &&
                node.getChildrenOfKind(ts.SyntaxKind.Identifier).length > 0) {
                const identifier = node.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
                const arrow = node.getChildrenOfKind(ts.SyntaxKind.ArrowFunction)[0];
                functions.set(identifier.getText(), {
                    function: arrow,
                });
            }
        }
    });
    return functions;
}
function buildMermaidCallGraph(functions) {
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
function getFunctionCalls(func) {
    const calls = [];
    func.forEachDescendant((node) => {
        if (node.getKindName() === "CallExpression" &&
            node.getFirstChildByKind(ts.SyntaxKind.Identifier)) {
            const call = node.getFirstChildByKind(ts.SyntaxKind.Identifier);
            calls.push(call.getText());
        }
    });
    return calls;
}
