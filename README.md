# SnowProc

Do you like stored procedures? I don't, to be completely honest. It's not the concept that bothers me, but rather the way most database platforms implement said concept: they are written in SQL. Now, SQL is a great language for querying databases and joining tables. But just as a fork isn't the most efficient way to eat soup, SQL may not be the best choice for anything that isn't querying. The scarcity of ways to avoid writing duplicate code and being overly verbose lead to - wait for it - duplicate, overly verbose code that waters down the logic it is supposed to express.

So, the idea of Snowflake using JavaScript for their implementation of stored procedures is an interesting one. While JS can certainly be expressive and elegant, a significant part of that stems from its ability to provide abstraction through modules. This is where the fun starts to die down somewhat. Snowflake has understandably chosen to severely limit the environment used to execute JS.
* Importing external dependencies is not supported
* Defining libraries for reuse in multiple procedures is not supported
* Using eval() is not supported
* Memory use is capped, though I haven't tested its exact limits yet

I want to reiterate that I understand why these restrictions are in place, but I also cannot deny their impact on the resulting code. Snowflake provides some basic objects and methods to execute queries, but it's pretty barebones. You end up writing a lot of duplicate boilerplate code for basic functionality for each new procedure. As an example, take the basic functionality of executing a SQL-statement and returning its results. Here's the shortest way to do it using native APIs:

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

Great! But a problem is starting to appear: re-use requires copy/pasting of this code. If I make some improvements to this function, I'd have to visit every procedure with this function in it and replace it with the newer version. Another unintended consequence of trying to make our code more concise is the existence of quite a bit of 'library'-setup at the start of each procedure. Finding what a procedure does means scrolling through multiple function definitions to find the bit that matters. 

Ideally, we'd write something like this: 

```typescript
return new SnowflakeClient()
    .execute('select first_name, last_name from people')
    .map(p =>  `${results.first_name} ${results.last_name}`);
```

Furthermore, the dynamic nature of JS allows for simple mistakes to slip through the cracks unnoticed until runtime. That's annoying when you're armed with an IDE with debugging functionality, but now imagine having to write JS without syntax highlighting or any indication of possible errors in your code. You could write the JavaScript-part of a procedure in something like VS Code with syntax highlighting to catch basic syntax errors, but then you'll have to switch between VS Code and the Snowflake UI. Also, forget about debugging or even console.log debugging. You're going to have to rely on errors thrown or results you return. 

## Introducing SnowProc
Catchy name, I know. Super-duper creative.

## Example
```typescript
import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";

export class TestProcedure extends Procedure {

    run = () : Array<string> =>  new SnowflakeClient() // create new snowflake client
            .execute('show users') // execute sql query and return QueryResult<any>
            .map(u => u.name); 
}
```


## Future
- Execute with parameters
- Session variables
- Introduce extended `Statement`-object
- Build object model for Snowflake, i.e. Account, Database, Warehouse, User. Further abstraction.

## Current limitations
- QueryResult can only be materialized once
    - possible solution: use result scan