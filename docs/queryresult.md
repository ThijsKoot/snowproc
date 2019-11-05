## QueryResult

QueryResult is SnowProc's adaptation of Snowflake's ResultSet-object.

* QueryResult mimics the behavior of an array, allowing you to iterate over rows like you would with a normal array.
* QueryResult remains virtual for as long as possible, meaning iterating and using forEach() only loads one row simultaneously
* QueryResult is generic (defaults to `any`), allowing you to map query results to statically typed classes

```typescript
        const client = new SnowflakeClient();
        const sql = 'show databases';
        
        let results = client.execute(sql); // returns QueryResult

        // filter mimics Array's filter, but only one filter can be applied to a resultset. 
        results
            .filter(row => row.somecolumn === 'somevalue') // applies filter and returns the QueryResult for further chaining
            .filter(row => row.othercol === 'othervalue'); // only this filter is applied;

        for (let row of results) {
            // do stuff
            // only loads one row into memory at a time
        }

        const arr = results.materialize(); // Loads all rows into memory, returns an array.

        const mapped = results.map(row => row.somecolumn); // Mimics Array.map(), equivalent to calling .materialize().map(row => row.somecolumn);

        results.forEach(row => {
            // do stuff
        });
```