import { ClassDeclaration, ts, ArrowFunction } from 'ts-morph'
import { Argument } from './Argument';
import { Rights } from '../procedure/Rights';

export class ProcedureDefinition {

    constructor(procedureClass: ClassDeclaration) {
        this.procedureClass = procedureClass;

        this.rights = this.getProcedureRights();
        this.argumentList = this.getArgumentList();

        this.argsParameter = this.argumentList
            .map(arg => `${arg.name} : ${arg.name.toUpperCase()}`)
            .join(',');
    }

    private getProcedureRights = () => {
        // try to get override first, then fall back to base class
        // TODO: workaround for properties of baseclass not having an initializer...
        try {
            const prop = this.procedureClass.getInstanceProperty('rights')
                || this.procedureClass.getBaseClass().getInstanceProperty('rights');

            const rightsKey = (prop.compilerNode as ts.PropertyDeclaration)
                .initializer
                .getText()
                .split('.')[1]; // Output is EnumType.Value for enums

            return Rights[rightsKey];
        }
        catch (error) {
            return Rights.Owner;
        }
    }

    procedureClass: ClassDeclaration;
    argumentsClass: ClassDeclaration;

    canReturnNull: boolean;
    rights: Rights;
    restoreState: boolean;

    argumentList: Argument[];
    argumentClassName: string;
    argsParameter: string;

    getName = () => this.procedureClass.getName();

    getArgumentType = () => {
        
    }

    getArgumentList = () => {
        const run = this.procedureClass
            .getProperty('run')
            .getInitializer() as ArrowFunction;

        let argType = run
            .getParameter('args')
            .getType();

        return argType
            .getProperties()
            .map(prop => <Argument>{
                name: prop.getName(),
                type: prop.getDeclarations()[0]
                    .getType()
                    .getText()
            });
    }

    getArgumentAssignments = () => {
        this.argumentList
            .map(arg => `${arg.name} : ${arg.name.toUpperCase()}`)
            .join(',');
    }

    getRunStatement = () => [
        `const proc = new ${this.getName()}();`,
        `const args = {${this.argsParameter}};`,
        `const client = new SnowflakeClient();`,
        `return proc.run(client, args);`
    ].join('\n');

    getArgumentSql = () => this.getArgumentList()
        .map(arg => arg.getProcedureParameterSql())
        .join(', ');
}