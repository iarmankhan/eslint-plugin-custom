const path = require('path');
const fs = require('fs');

module.exports = {
    rules: {
        'no-relative-parent-imports': {
            meta: {
                type: "problem",
                docs: {
                    description: "Disallow relative imports from parent directories.",
                    category: "Possible Errors",
                    recommended: true,
                },
                schema: [],
            },
            create(context) {
                const projectRootDir = process.cwd();
                const srcDir = path.resolve(projectRootDir, 'src');
                const namespaceDirs = fs.readdirSync(srcDir)
                    .map((dir) => path.join(srcDir, dir))
                    .filter((dir) => fs.statSync(dir).isDirectory());

                console.log({namespaceDirs})

                return {
                    ImportDeclaration(node) {
                        const source = node.source.value;
                        const isRelativeImport = source.startsWith('.');
                        const isParentImport = source.startsWith('..');

                        if (isRelativeImport && isParentImport) {

                            const currentFileDir = path.dirname(context.getFilename());
                            const parentDir = path.join(currentFileDir, source);
                            const currentFileDirNamespace = namespaceDirs.find((dir) => currentFileDir.startsWith(dir));
                            const parentDirNamespace = namespaceDirs.find((dir) => parentDir.startsWith(dir));

                            if (parentDirNamespace !== currentFileDirNamespace) {
                                context.report({
                                    node,
                                    message: 'Relative imports from parent directories are not allowed.',
                                });
                            }
                        }
                    },
                };
            }
        },
        'no-absolute-path': {
            meta: {
                type: "problem",
                docs: {
                    description: "Disallow absolute imports from same directory.",
                    category: "Possible Errors",
                    recommended: true,
                },
                schema: [],
            },
            create(context) {
                return {
                    ImportDeclaration(node) {
                        const source = node.source.value;
                        const isAbsoluteImport = source.startsWith("/") || source.startsWith("~");

                        if(isAbsoluteImport) {
                            const importPathWithoutFileNames = source.substring(1).split("/").slice(0, -1).join("/");
                            const fileDirectory = context.getFilename().split("/").slice(0, -1).join("/");
                            const isModuleInSameDirectory = fileDirectory.endsWith(importPathWithoutFileNames);

                            if (isModuleInSameDirectory) {
                                context.report({
                                    node,
                                    message: "Absolute imports from same directory are not allowed.",
                                });
                            }
                        }

                    }
                };
            }
        }
    }
};
