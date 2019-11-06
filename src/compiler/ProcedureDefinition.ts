import { ClassDeclaration, ts } from 'ts-morph'
import { Argument } from './Argument';
import { Rights } from '../procedure/Rights';

export class ProcedureDefinition {

    constructor(procedureClass: ClassDeclaration, argClasses: ClassDeclaration[]) {
        this.procedureClass = procedureClass;

        this.argumentsClass = argClasses.find(a => a.getName() === this.getArgumentClassName());
        
        // TODO: workaround for properties of baseclass not having an initializer...
        try{
            const rightsKey = this.getPropertyValue('rights').split('.')[1]; // Output from getPropertyValue is EnumType.Value for enums
            this.rights = Rights[rightsKey];
        }
        catch(error) {
            this.rights = Rights.Owner;
        }
    }

    private getPropertyValue = (name: string) => {
        // try to get override first, then fall back to base class
        const prop = this.procedureClass.getInstanceProperty(name)
            || this.procedureClass.getBaseClass().getInstanceProperty(name);

        return (prop.compilerNode as ts.PropertyDeclaration).initializer.getText();
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

    getArgumentClassName = () => {
        var member = this.procedureClass.getMember('args') 
            || this.procedureClass.getBaseClass().getMember('args');

        return member.getType()
            .compilerType
            .symbol
            .name;
    }

    getRunStatement = () => [
        `const proc = new ${this.getName()}();`,
        `proc.args = new ${this.getArgumentClassName()}();`,
        this.getArgumentAssignments('proc.args'),
        `return proc.run();`
    ].join('\n');

    getArgumentSql = () => this.getArgumentList()
        .map(arg => arg.getProcedureParameterSql())
        .join(', ');

    getArgumentAssignments = (instanceName: string) => this.getArgumentList()
        .map(arg => `declare const ${arg.name.toUpperCase()} : ${arg.type};
                ${instanceName}.${arg.name} = ${arg.name.toUpperCase()};`)
        .join('\n');
}

