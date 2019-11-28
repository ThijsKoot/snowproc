SnowProc
=======
![npm](https://img.shields.io/npm/dt/snowproc)
Stored procedures for Snowflake written in Typescript. Extends the native JS APIs provided by Snowflake and provides a more streamlined, less error-prone method of writing stored procedures. SnowProc's helpful classes and abstractions reduce the amount of boilerplate you need to write in order to concisely express your logic. 

Compiles down to native JavaScript and creates a DML-statement.

Documentation and examples in the [wiki](https://github.com/thijskoot/SnowProc/wiki).

### Installation and setup
Install: 
```
    npm install snowproc
```

Scaffold a new project:
```
    npx snowproc-new
```


### Example
```typescript
import { Arguments, Procedure, SnowflakeClient } from 'snowproc';

export class ProcArgs extends Arguments {
    stringArg: string;
    dateArg: Date;
    numArg: number;
}

export class DemoProcedure extends Procedure {
    rights =  Rights.Caller;

    run = (client, args : ProcArgs) => {
        var results = new SnowflakeClient()
            .execute('show databases')
            .materialize();
        
        return {queryResults: results, arguments: args}
    }
}
```

### Building

Compile with:
```
npx snowproc-compile
```

Output will be located in the directory specified in tsconfig.json (default: dist)

```javascript
create procedure SimpleTest(arg STRING)
	returns variant
	language javascript
	execute as Owner
	as
$$
// a lot of boilerplate you don't need to write
class Arguments {
}
class SimpleTest extends Procedure {
    constructor() {
        super(...arguments);
        this.run = (client, args) => {
            // your code
        };
    }
}
const proc = new SimpleTest();
const args = { arg: ARG };
const client = new SnowflakeClient();
return proc.run(client, args);
$$;
```

### Current limitations
- Parameterized queries not supported as of yet
- QueryResult can only be materialized/looped through once
    - Possible solution: use resultscan of query id when next() returns false