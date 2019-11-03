import { ClassDeclaration } from 'ts-morph'
import { Argument } from './Argument';
import { Rights } from '../procedure/Rights';

export class ProcedureDefinition {

    constructor(procedureClass: ClassDeclaration, argClasses: ClassDeclaration[]) {
        this.procedureClass = procedureClass;
        this.argumentsClass = argClasses.find(a => a.getName() === this.getArgumentClassName());
    }

    procedureClass: ClassDeclaration;
    argumentsClass: ClassDeclaration;

    canReturnNull: boolean;
    rights: Rights;
    restoreState: boolean;

    argumentList: Argument[];
    argumentClassName: string;

    getName = () => this.procedureClass.getName();

    getArgumentList = () => this.argumentsClass
        .getMembers()
        .map(m => <Argument>{
            name: m.getSymbol().getName(),
            type: m.getType().getText()
        });

    getArgumentClassName = () => this.procedureClass
        .getMember('args')
        .getType()
        .compilerType
        .symbol
        .name;

    getRunStatement = () => `return new ${this.getName()}().run();`

    getArgumentSql = () => this.getArgumentList()
        .map(arg => arg.getProcedureParameterSql())
        .join(', ');

    getArgumentAssignments = () => this.getArgumentList()
        .map(arg => `declare const ${arg.name.toUpperCase()} : ${arg.type};
                ${this.getArgumentClassName()}.${arg.name} = ${arg.name.toUpperCase()};`)
        .join('\n');
}

