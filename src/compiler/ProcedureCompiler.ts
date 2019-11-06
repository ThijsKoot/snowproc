
import { Project, ts, ClassDeclaration, SourceFile } from "ts-morph";
import { ProcedureDefinition } from "./ProcedureDefinition";
import { writeFile, writeFileSync } from "fs";
import { TypeMap } from "./Typemap";
import * as fs from 'fs';
import { Rights } from "../procedure/Rights";
import shell = require('shelljs');
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

        [outDir, tmpDir]
            .filter(d => !fs.existsSync(d))
            .forEach(d => fs.mkdirSync(d));

        const argumentsFile = path.join(libDir, 'procedure', 'Arguments.ts'); // to add argbase to argImplementations
        sourceProject.addExistingSourceFile(argumentsFile);

        let sourceFiles = sourceProject.getSourceFiles();

        // find implementations of procedure classes
        let procImplementations = this.findImplementingClasses(sourceFiles, 'Procedure');
        let argImplementations = this.findImplementingClasses(sourceFiles, 'Arguments');
        
        var argsBase = sourceFiles
            .map(file => file.getClasses())
            .reduce((flat, arr) => flat.concat(arr), new Array<ClassDeclaration>())
            .find(c => c.getName() === 'Arguments');

        argImplementations.push(argsBase);

        for (let implementation of procImplementations) {

            let project = new Project({
                manipulationSettings: {},
                compilerOptions: { target: ts.ScriptTarget.ES2019 }
            });

            let proc = new ProcedureDefinition(implementation, argImplementations);

            const tmpFilePath = path.join(tmpDir, `${proc.getName()}.ts`);

            let source = project.createSourceFile(tmpFilePath);

            this.addLibFiles(source, libDir);

            source.addClass(proc.argumentsClass.getStructure());
            source.addClass(proc.procedureClass.getStructure());

            source.insertText(source.getEnd(), proc.getRunStatement());

            source.formatText({ convertTabsToSpaces: true, indentStyle: ts.IndentStyle.Smart });

            var emitted = project.emitToMemory({
                customTransformers: {
                    before: [context => sourceFile => this.visitSourceFile(sourceFile, context, this.removeInvalidNodes)],
                    after: [],
                    afterDeclarations: []
                }
            });

            var procText = emitted.getFiles()[0].text;

            let argSql = proc.getArgumentList()
                .map(a => `${a.name.toUpperCase()} ${TypeMap[a.type]}`)
                .join(', ');

            let procSql = [
                `create procedure ${proc.getName()}(${argSql})`,
                '\treturns variant',
                '\tlanguage javascript',
                `\texecute as ${Rights[proc.rights]}`,
                '\tas',
                '$$',
                `${procText}`,
                '$$;'].join('\n');

            const outFile = path.join(outDir, `${proc.getName()}.sql`);
            
            writeFileSync(outFile, procSql);

            console.log(`Generated procedure ${proc.getName()} `);
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
        if (node.kind === ts.SyntaxKind.ExportKeyword || node.kind == ts.SyntaxKind.ImportDeclaration)
            return undefined;
        return node;
    }
}
