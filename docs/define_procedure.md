## General layout

```typescript
import { Procedure, SnowflakeClient, Rights, Arguments } from "snowproc";

export class ProcArgs extends Arguments {
    stringArg: string;
}

export class DemoProcedure extends Procedure {
    args: ProcArgs; // Declare type of Arguments-class, compiler will provide an instance
    rights =  Rights.Caller; // Define if procedure is called with caller's or owner's rights

    run = () => {
        // write procedure logic here        

        return { }
    }
}
```

### Arguments
To define and use parameters, create a class that inherits from `Arguments`. Change type of the args-property of `Procedure` to type of the args-class. Access them in `run()` using `this.args`.

Datatypes of arguments are automatically converted to Snowflake datatypes when creating the DML-statement.

```typescript
export class ProcArgs extends Arguments {
    stringArg: string; // Snowflake: STRING
    dateArg: Date; // Snowflake: TIMESTAMP
    numberArg: number; // Snowflake: FLOAT
}

export class GrantRoleToGroup extends Procedure {
    // Declare type of Arguments-class 
    // No need to create an instance, compiler will provide one
    args: ProcArgs;

    run = () => {
        const a = this.args.stringArg; // access via this.args
    }
}
```

### Directory structure
```
root
 ├────dist            Default output directory for compiled procedures
 |
 ├────src             define your procedures here
 |
 └────tsconfig.json   Typescript configuration
```