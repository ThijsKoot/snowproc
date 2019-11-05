SnowProc
=======

Stored procedures for Snowflake written in Typescript. Extends the native JS APIs provided by Snowflake and provides a more streamlined, less error-prone method of writing stored procedures. SnowProc's helpful classes and abstractions reduce the amount of boilerplate you need to write in order to concisely express your logic. 

Compiles down to native JavaScript and creates a DML-statement.

Documentation and examples in the [wiki](https://github.com/thijskoot/SnowProc/wiki).

### Installing SnowProc

Clone this repository, run `npm install` and start developing!
```
    git clone https://github.com/ThijsKoot/snowproc.git
    cd snowproc
    npm install
```

Will be made available as a Node-package in the future.

### Example
```typescript
export class ProcArgs extends Arguments {
    stringArg: string;
    dateArg: Date;
    numArg: number;
}

export class DemoProcedure extends Procedure {
    args: ProcArgs;
    rights =  Rights.Caller;

    run = () => {
        var results = new SnowflakeClient()
            .execute('show databases')
            .materialize();
        
        return <any>{queryResults: results, arguments: this.args}
    }
}
```

### Building

To start the build, open a terminal in the root of the directory and execute build.ps1. The generated procedures will be output to the `./built` folder.


### Current limitations
- Parameterized queries not supported as of yet
- QueryResult can only be materialized/looped through once
    - Possible solution: use resultscan of query id when next() returns false