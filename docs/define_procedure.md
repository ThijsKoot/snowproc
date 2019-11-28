## General layout

To define a prodecure, create a class that inherits from `Procedure` and override the `run`-method. `run` has two parameters, `client: SnowflakeClient` and `args`. Note that the type-annotation for `client` is purely there to help the with autocomplete and type-suggestions, you can create a method without the annotation (though I don't know why you would). Read the section about Arguments for more information on the `args`-parameter. The return-type for procedures built with SnowProc is variant, so you can return any object or array from the `run`-method.

```typescript
import { Procedure, SnowflakeClient, Rights } from "snowproc";

class DemoProcedure extends Procedure {
    rights =  Rights.Caller; // Define if procedure is called with caller's or owner's rights

    run = (client: SnowflakeClient, args: { stringArg: string; numberArg: number; }) => {
        // write procedure logic here        
        
        return { }
    }
}
```

### Arguments
To define and use parameters, specify the the type of the args-parameter in `run(client, args)`. This can be done inline or using a typed class. 

Datatypes of arguments are automatically converted to Snowflake datatypes when creating the DML-statement.

```typescript
class ProcArgs extends Arguments {
    stringArg: string; // Snowflake: STRING
    dateArg: Date; // Snowflake: TIMESTAMP
    numberArg: number; // Snowflake: FLOAT
}

run = (client: SnowflakeClient, args: { stringArg: string}) {
    // inline type definition is better for simple arguments
}

run = (client: SnowflakeClient, args: ProcArgs;) => {
    // specifying with a typed class can be better for legibility with multiple arguments
    const a = args.stringArg; // access via this.args
}



```

### Directory structure
```
root
 ├────dist            Default output directory for compiled procedures
 |
 ├────src             Define your procedures here unless otherwise specified in tsconfig
 |
 └────tsconfig.json   Typescript configuration
```