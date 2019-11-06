import { TypeMap } from "./Typemap";

export class Argument {
    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
        console.log(this.getProcedureParameterSql())
    }

    name: string;
    type: string;

    getProcedureParameterSql = () => `${this.name.toUpperCase()} ${TypeMap[this.type]}`;
}