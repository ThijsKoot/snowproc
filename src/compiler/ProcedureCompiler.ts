
import { Project, ts, ClassDeclaration, SourceFile, ArrowFunction, TypeLiteralNode, PropertyDeclaration, PropertySignature } from "ts-morph";
import { ProcedureDefinition } from "./ProcedureDefinition";
import { writeFileSync } from "fs";
import { TypeMap } from "./Typemap";
import * as fs from 'fs';
import { Rights } from "../procedure/Rights";
import * as path from 'path';
import * as os from "os";

export class ProcedureCompiler {
    constructor() {

    }

    /**
     * Adds SnowProc library files to sourcefile
     * @param sourceFile SourceFile to add lib files to
     * @param libLocation Location of lib files
     */
    private addLibFiles(sourceFile: SourceFile, libLocation: string) {
        for (let item of ['internal', 'core', 'procedure']) {
            const folder = path.join(libLocation, item);

            fs.readdirSync(folder)
                .filter(f => !f.endsWith('.d.ts'))
                .map(f => path.join(folder, f))
                .map(f => `${fs.readFileSync(f, 'utf-8')}\n\n`)
                .forEach(x => sourceFile.insertText(sourceFile.getEnd(), x));
        }
    }

    findImplementingClasses = (sourcefiles: SourceFile[], baseClass: string) =>
        sourcefiles.map(file => file.getClasses())
            .reduce((flat, arr) => flat.concat(arr), new Array<ClassDeclaration>())
            .filter(c => c.getBaseClass() !== undefined
                && c.getBaseClass().getName() === baseClass);


    compile(tsconfig: string, moduleRoot: string) {
        // initialize
        const sourceProject = new Project({
            manipulationSettings: {},
            compilerOptions: { target: ts.ScriptTarget.ES2019 },
            tsConfigFilePath: tsconfig
        });

        const outDir = sourceProject.getCompilerOptions().outDir;
        const tmpDir = path.join(os.tmpdir(), 'snowproc');
        const libDir = path.join(moduleRoot, 'src');

        // Create required directories if they don't exist
        [outDir, tmpDir]
            .filter(d => !fs.existsSync(d))
            .forEach(d => fs.mkdirSync(d));

        let sourceFiles = sourceProject.getSourceFiles();

        let concatenatedSource = sourceFiles.map(f => f.getText()).join('\n');

        // find implementations of procedure classes in all source files
        let procedureClasses = sourceFiles.map(file => file.getClasses())
            .reduce((flat, arr) => flat.concat(arr), new Array<ClassDeclaration>())
            .filter(c => c.getBaseClass() !== undefined
                && c.getBaseClass().getName() === 'Procedure');

        for (let procedureClass of procedureClasses) {

            let project = new Project({
                manipulationSettings: {},
                compilerOptions: { target: ts.ScriptTarget.ES2019 }
            });

            let procDefinition = new ProcedureDefinition(procedureClass);
            const tmpFilePath = path.join(tmpDir, `${procDefinition.getName()}.ts`);
            let source = project.createSourceFile(tmpFilePath);

            this.addLibFiles(source, libDir);

            source.insertText(source.getEnd(), concatenatedSource);

            // Remove all other Procedures from new SourceFile
            for (let statement of source.getStatements()) {
                const item = statement as ClassDeclaration;
                
                if(item.getStructure !== undefined) {

                    const structure = item.getStructure();

                    if (structure.extends !== undefined
                        && structure.extends === 'Procedure'
                        && structure.name !== procDefinition.getName()) {
                        source.removeStatement(statement.getChildIndex());
                    }
                }
            }

            source.insertText(source.getEnd(), procDefinition.getRunStatement());

            source.formatText({ convertTabsToSpaces: true, indentStyle: ts.IndentStyle.Smart });

            var emitted = project.emitToMemory({
                customTransformers: {
                    before: [context => sourceFile => this.visitSourceFile(sourceFile, context, this.removeInvalidNodes)],
                    after: [],
                    afterDeclarations: []
                }
            });

            var procText = emitted.getFiles()[0].text;

            let argSql = procDefinition.getArgumentList()
                .map(a => `${a.name.toUpperCase()} ${TypeMap[a.type]}`)
                .join(', ');

            let procSql = [
                `create or replace procedure ${procDefinition.getName()}(${argSql})`,
                '\treturns variant',
                '\tlanguage javascript',
                `\texecute as ${Rights[procDefinition.rights]}`,
                '\tas',
                '$$',
                `${procText}`,
                '$$;'].join('\n');

            const outFile = path.join(outDir, `${procDefinition.getName()}.sql`);

            writeFileSync(outFile, procSql);

            console.log(`Generated procedure ${procDefinition.getName()} `);
        }

        fs.rmdirSync(tmpDir);
    }

    visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext, visitNode: (node: ts.Node) => ts.Node) {
        return visitNodeAndChildren(sourceFile) as ts.SourceFile;

        function visitNodeAndChildren(node: ts.Node): ts.Node {
            return ts.visitEachChild(visitNode(node), visitNodeAndChildren, context);
        }
    }

    removeInvalidNodes(node: ts.Node) {
        if (node.kind === ts.SyntaxKind.ExportKeyword 
            || node.kind == ts.SyntaxKind.ImportDeclaration)
            return undefined;
        return node;
    }
}
