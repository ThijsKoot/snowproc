## Install
Install: 
```
    npm install snowproc
```

Scaffold a new project:
```
    npx snowproc-new
```

## Build
Run:
```
npx snowproc-compile
```

Output will be located in the directory specified in tsconfig.json (default: dist).

A compiled procedure will look like this:

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

### Compiler steps

The compilation process is as follows:
1. SnowProc looks for classes that inherit from Procedure and Arguments
2. Generate additional code for running in Snowflake
3. Concatenate all code including SnowProc libraries into a single file
4. Invoke Typescript-compiler to transpile to plain JavaScript
5. Add surrounding SQL-statement based on procedure and its properties