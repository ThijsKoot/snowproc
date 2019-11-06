#!/usr/bin/env node
import { ProcedureCompiler } from "../compiler/ProcedureCompiler";
import findNodeModules = require('find-node-modules');
import * as path from 'path'
import shell = require('shelljs');
import { ArgumentParser } from "argparse";

var parser = new ArgumentParser({
    version: '0.2.0',
    addHelp: true,
    description: 'Compile Snowflake Procedure',
    usage: "snowproc-compile [--target tsconfig.json]"
});

parser.addArgument(
    ['-t', '--target'],
    {
        help: 'specify tsconfig.json',
        defaultValue: 'tsconfig.json',
    },
);

const args = parser.parseArgs();

const node_modules = findNodeModules()[0];
const moduleDir = path.join(node_modules, 'snowproc');

const configFile = args['target'];

const compiler = new ProcedureCompiler();

compiler.compile(configFile, moduleDir);
