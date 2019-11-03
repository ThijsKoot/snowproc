import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";

export class TestProcedure extends Procedure {

    run = () : Array<string> =>  new SnowflakeClient() // create new snowflake client
            .execute('show users') // execute sql query and return QueryResult<any>
            .map(u => u.name); 
}