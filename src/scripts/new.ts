#!/usr/bin/env node
import * as fs from 'fs'
import findNodeModules = require('find-node-modules');
import shell = require('shelljs');
import { ArgumentParser } from 'argparse';
import * as path from 'path'
import { sys } from 'typescript';

var parser = new ArgumentParser({
    version: '0.2.0',
    addHelp: true,
    description: 'Create new Snowflake Procedure',
    usage: "new-snowflake-procedure --name myprocedure --output ./myprocedures"
});
parser.addArgument(
    ['-o', '--output'],
    {
        help: 'output directory',
        defaultValue: '.'
    },
);

parser.addArgument(
    ['-n', '--name'],
    {
        help: 'name of procedure',
        defaultValue: 'NewProcedure.ts'
    }
);

const args = parser.parseArgs();
const outDir = args['output'];
const procName = args['name'];
const procPath = path.join(outDir, 'src', `${procName}.ts`);

if (!fs.existsSync(procPath)) {
    fs.mkdirSync(procPath, { recursive: true });
}

shell.exec(`pushd ${outDir} && npm i snowproc --save-dev && popd`);

const node_modules = findNodeModules()[0];
const scaffoldDir = path.join(node_modules, 'scaffold');
const tsconfigPath = path.join(outDir, 'tsconfig.json')

if (!fs.existsSync(tsconfigPath)) {
    let configScaffold = path.join(scaffoldDir, 'tsconfig.json');
    fs.copyFileSync(configScaffold, tsconfigPath);
}

if (fs.existsSync(procPath)) {
    console.error(`Procedure ${procName} already exists`);
    sys.exit(1);
}
else {
    const templatePath = path.join(scaffoldDir, 'src', 'NewProcedure.ts')
    const proc = fs
        .readFileSync(scaffoldDir, templatePath)
        .toString()
        .replace("NewProcedure", procName);
    fs.writeFileSync(procPath, proc);

}