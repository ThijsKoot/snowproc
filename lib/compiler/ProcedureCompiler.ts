
import { Project, ts, ClassDeclaration, SourceFile } from "ts-morph";
import { ProcedureDefinition } from "./ProcedureDefinition";
import { writeFile, writeFileSync } from "fs";
import { TypeMap } from "./Typemap";
import * as fs from 'fs';

export class ProcedureCompiler {

    findImplementingClasses = (sourcefiles: SourceFile[], baseClass: string) => 
        sourcefiles.map(file => file.getClasses())
            .reduce((flat, arr) => flat.concat(arr), new Array<ClassDeclaration>())
            .filter(c => c.getBaseClass() !== undefined 
                && c.getBaseClass().getName() === baseClass);

    compile(tsconfig: string) {
        // initialize
        const sourceProject = new Project({
            manipulationSettings: {},
            compilerOptions: { target: ts.ScriptTarget.ES2019 },
            tsConfigFilePath: tsconfig
        });

        let sourceFiles = sourceProject.getSourceFiles();
        let internals = new Array<string>();
        
        for (let item of ['internal', 'core', 'procedure']) {
            const folder = `lib/${item}`;
            
            fs.readdirSync(folder)
                .filter(f => !f.endsWith('.d.ts'))
                .map(f => `${folder}/${f}`)
                .map(f => `${fs.readFileSync(f, 'utf-8')}\n\n`)
                .forEach(f => internals.push(f));
        }

        // find implementations of procedure classes
        let procImplementations = this.findImplementingClasses(sourceFiles, 'Procedure');
        let argImplementations = this.findImplementingClasses(sourceFiles, 'Arguments');

        for (let implementation of procImplementations) {

            let project = new Project({
                manipulationSettings: {},
                compilerOptions: { target: ts.ScriptTarget.ES2019 }
            });

            let proc = new ProcedureDefinition(implementation, argImplementations);

            let source = project.createSourceFile(`./tmp/${proc.getName()}.ts`);

            internals.forEach(x => source.insertText(source.getEnd(), x));

            source.addClass(proc.argumentsClass.getStructure());

            source.insertText(source.getEnd(), proc.getArgumentAssignments());

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
                '\tas',
                '$$',
                `${procText}`,
                '$$;'].join('\n');

            writeFileSync(`built/${proc.getName()}.sql`, procSql);

            console.log(`Generated procedure ${proc.getName()} `);
            // console.log(procText);
            // generate procedure surroundings
        }
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
