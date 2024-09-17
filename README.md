# tree-surgeon

The goal of this project is to make refactoring large TypeScript files easier by providing helpful information about the structure of the code (using abstract syntax trees).

For example, say you have a 1000 line React component that you want to break into smaller pieces. Using mermaid syntax, tree-surgeon can generate a call tree showing which methods are being called by which other methods, allowing you to better identify seams for extracting code with high cohesion.  