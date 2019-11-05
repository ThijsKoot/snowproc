## SnowflakeClient

Interaction with Snowflake is provided by the SnowflakeClient class. Feel free to create as many instances as you like, they are stateless and refer to the same static `snowflake`-object provided by the environment. A notable missing feature in this initial release are parameterized SQL-statements. 

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