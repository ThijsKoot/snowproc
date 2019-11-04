# Stored Procedures in Snowflake

Do you like stored procedures? I don't, to be completely honest. It's not the concept that bothers me, but rather the way most database platforms implement said concept: they are written in SQL. Now, SQL is a great language for querying databases and joining tables. But just as a fork isn't the most efficient way to eat soup, SQL may not be the best choice for anything that isn't querying. The scarcity of ways to avoid writing duplicate code and being overly verbose lead to - wait for it - duplicate, overly verbose code that waters down the logic it is supposed to express.

So, the idea of Snowflake using JavaScript for their implementation of stored procedures is an interesting one. While JS can certainly be expressive and elegant, a significant part of that stems from its ability to provide abstraction through modules. This is where the fun starts to die down somewhat. Snowflake has understandably chosen to severely limit the environment used to execute JS.
* Importing dependencies from external is not supported, though this does make sense
* Defining libraries for reuse in multiple procedures is not supported
* Using eval() is not supported
* Memory use is capped, though I haven't tested its exact limits yet

I want to reiterate that I understand why these restrictions are in place, but I also cannot deny their impact on the resulting code. 

The dynamic nature of JS allows for simple mistakes to slip through the cracks unnoticed until runtime. That's annoying when you're armed with an IDE with debugging functionality, but now imagine having to write JS without syntax highlighting or any indication of possible errors in your code. You could write the JavaScript-part of a procedure in something like VS Code with syntax highlighting to catch basic syntax errors, but then you'll have to switch between VS Code and the Snowflake UI. Also, forget about debugging or even console.log debugging. You're going to have to rely on errors thrown or results you return. 

Snowflake provides some basic objects and methods to execute queries, but it's pretty barebones. You end up writing a lot of duplicate boilerplate code for basic functionality for each new procedure. As an example, take the basic functionality of executing a SQL-statement and returning its results. Here's the shortest way to do it using native APIs:

```javascript
var results = snowflake.execute({sqlText: 'select first_name, last_name from people'});
var returnValues = [];

while(results.next()) {
    var full_name = `${results.first_name} ${results.last_name}`;
    returnValues.push(full_name);
}

return returnValues;
```

Even for this tiny, contrived example we're writing a lot of boilerplate code. The native APIs require us to:
* Create a results object
* Declare an array
* Manually loop through the results using `.next()` 
* Push each record to the array
* Finally, return the array

As the complexity of the task at hand grows, so does the amount of boilerplate you're required to write. My natural instinct when encountered with this type of situation is to write functions for common tasks. For example, executing a query could be shortened to: 

```javascript
const execute = (sql) => snowflake.execute({ sqlText: sql });
execute('select first_name, last_name from people');
```

Not too bad, I wouldn't mind writing this on top of every procedure, though I'd obviously prefer to define it once and use it in other places. Next up: looping through the resultset. Ideally, the ResultSet-type would mimic a native JavaScript array, allowing you to use filter(), map(), forEach() and so on. So, let's try that:

```javascript
function executeObjectArray(sql) {
    let statement = snowflake.createStatement({ sqlText: sql })
    let resultSet = statement.execute();

    let columnCount = statement.getColumnCount();

    columnNames = [];

    for (i = 1; i <= columnCount; i++) {
        let name = statement.getColumnName(i);
        columnNames.push(name);
    }

    let results = [];

    while (resultSet.next()) {
        let result = {}
        columnNames.forEach(key => result[key.toLowerCase()] = resultSet[key]);
        results.push(result);
    }

    return results;
}

return executeObjectArray('select first_name, last_name from people')
    .map(p => `${p.first_name} ${p.last_name}`);
```

Great! But a problem starts to appear: re-use requires copy/pasting of this code. If I make some improvements to this function, I'd have to visit every procedure with this function in it and replace it with the newer version. Another unintended consequence of trying to make our code more concise is the existence of quite a bit of 'library'-setup at the start of each procedure. Finding what a procedure does means scrolling through multiple function definitions to find the bit that matters. 

Ideally, we'd write something like this:

```typescript
return new SnowflakeClient()
    .execute('select first_name, last_name from people')
    .map(p =>  `${results.first_name} ${results.last_name}`);
```

Spoiler: you can. These 3 lines do the exact same thing as the 7 lines (not counting whitespace) we started out with. But how?

# Introducing SnowProc
Catchy name, I know. Super-duper creative. So, what is it? The short summary is that SnowProc is a Typescript library/framework that enables you to define stored procedures for Snowflake using nothing but Typescript. SnowProc offers helpful classes and abstractions to reduce the amount of boilerplate you need to write in order to concisely express your logic. 

## Defining a procedure
As an example, here's a procedure that assigns a role to users with a certain text in their comment-field (from SHOW USERS). During the procedure we have to execute statements using different roles. Kind of contrived but it works well enough as an example. It takes two parameters of type string, and returns an object containing the roleName-parameter and the users it was assigned to. 


### Arguments
To define and use parameters, create a class that inherits from `Arguments`. Change type of the args-property of `Procedure` to type of the args-class. Access them in `run()` using `this.args`. 

```typescript
export class ProcArgs extends Arguments {
    groupName: string;
    roleName: string;
}

export class GrantRoleToGroup extends Procedure {
    args: ProcArgs; // Declare type of Arguments-class, compiler will provide an instance

    run = () => {
        const groupName = this.args.groupName;
    }
}
```

### Interacting with Snowflake
Interaction with Snowflake is provided by the SnowflakeClient class. Feel free to create as many instances as you like, they are stateless and refer to the same static `snowflake`-object provided by the environment.

```typescript
class Database {
    name: string;
    owner: string;
}
export class GrantRoleToGroup extends Procedure {
    run = () => {
        const client = new SnowflakeClient(); // "New" instance
        const results = client.execute('show databases'); // execute query, returns a QueryResult
        const genericResults = client.execute<Database>('show databases'); // execute query, return QueryResult<Station>
        
        const resultsFromRole = client.executeAs('show databases in account', 'accountadmin'); // execute query as role

        client.execute('some ddl/dml'); // if you don't care about the results
        client.useRole('myrole'); // switch the current role for this procedure
        client.useDatabase('mydb'); // switch the current db for this procedure
        client.useSchema('myschema'); // switch the current schema for this procedure
    }
}
```


### End result
```typescript
import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";
import { Rights } from "../lib/procedure/Rights";
import { Arguments } from "../lib/procedure/Arguments";

export class ProcArgs extends Arguments {
    groupName: string;
    roleName: string;
}

export class GrantRoleToGroup extends Procedure {
    rights = Rights.Caller; // Execute procedure as Caller
    args: ProcArgs; // Declare type of Arguments-class, compiler will provide an instance

    // Define procedure logic
    run = () => {
        const client = new SnowflakeClient(); // Create Snowflake client
        
        const users = client
            .executeAs('show users', 'accountadmin') // Retrieve users as accountadmin
            .filter(u => u.comment === this.args.groupName) // Filter retrieved results
            .map(u => u.name); // Select username

        for(const user of users) {
            // Assign role as securityadmin to each user
            client.executeAs(`grant role ${this.args.roleName} to user ${user}`, 'securityadmin'); 
        };

        // return the assigned role and the users it was assigned to
        return  { users: users, assignedRole: this.args.roleName };
    }
}
```

## Compilation process
The compilation process is as follows:
1. SnowProc looks for classes that inherit from Procedure and Arguments
2. Generate additional code for running in Snowflake
3. Concatenate all code including SnowProc libraries into a single file
4. Invoke Typescript-compiler to transpile to plain JavaScript
5. Add surrounding SQL-statement based on procedure and its properties
6. ???
7. Profit


## 

Some highlights: 
* QueryResult mimics the behavior of an array, allowing you to iterate over rows like you would with a normal array.
* QueryResult remains virtual for as long as possible, meaning iterating and using forEach() only loads one row simultaneously
* QueryResult can be generic (defaults to `any`), allowing you to map query results to statically typed classes
* SnowflakeClient has shortcut-functions to switch to a different role, database or schema
* SnowflakeClient provides `executeAs(sql, role)` to execute a SQL-statement using a different role without altering the entire session
* Procedure arguments are defined in an Arguments-class, allowing you to use statically typed procedure arguments 

## Example
```typescript
import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";
import { Arguments } from "../lib/procedure/Arguments";

export class TestArguments extends Arguments {

}

export class TestProcedure extends Procedure {

    args: TestArguments;

    run = () : Array<string> => new SnowflakeClient() // create new snowflake client
            .execute('select first_name, last_name from people') // execute sql query and return QueryResult<any>
            .map(p => `${p.first_name} ${p.last_name}`); 
}
```


## Future
- Execute with parameters
- Session variables
- Introduce extended `Statement`-object
- Build object model for Snowflake, i.e. Account, Database, Warehouse, User. Further abstraction.

## Current limitations
- QueryResult can only be materialized once
    - Possible solution: use resultscan of query id when next() returns false
- Procedure must have arguments defined even if unused