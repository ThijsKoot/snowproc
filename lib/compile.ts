import { ProcedureCompiler } from "./compiler/ProcedureCompiler";

var compiler = new ProcedureCompiler();

compiler.compile(process.argv[2]);