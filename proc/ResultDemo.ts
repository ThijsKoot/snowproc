import { Procedure } from "../lib/procedure/Procedure";
import { Arguments } from "../lib/procedure/Arguments";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";
import { strict } from "assert";

class ResultDemo extends Procedure {
   
    run = () => {
        const client = new SnowflakeClient();
        const sql = 'show databases';
        
        let results = client.execute(sql);

        // filter mimics Array's filter, but only one filter can be applied to a resultset. 
        results
            .filter(row => row.somecolumn === 'somevalue') // applies filter and returns the QueryResult for further chaining
            .filter(row => row.othercol === 'othervalue'); // only this filter is applied;

        for (let row of results) {
            // do stuff
            // only holds one row into memory at a time
        }

        const arr = results.materialize(); // Loads all rows into memory, returns an array.
        const mapped = results.map(row => row.somecolumn); // Mimics Array.map(), equivalent to calling .materialize().map(row => row.somecolumn);

        results.forEach(row => {
            // do stuff
        });
    }
}