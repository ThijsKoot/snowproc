import { Snowflake } from "../internal/Snowflake";
import { QueryResult } from "./QueryResult";
import { SQLCommand } from "../internal/SqlCommand";
import { StateManager } from "./StateManager";

declare var snowflake: Snowflake;

export class SnowflakeClient {
    snowflake: Snowflake;

    constructor() {
        this.snowflake = snowflake;
    }

    /**
     * @method execute Run a query and return a `QueryResult` mapped to `T`
     * 
     * @param sql Query
     */
    execute<T = any>(sql: string): QueryResult<T> {
        let command = new SQLCommand(sql);
        let statement = this.snowflake.createStatement(command);
        let internalResults = statement.execute();

        return new QueryResult(internalResults, statement);
    }

    useDatabase = (database: string) => this.execute(`use database ${database}`);
    useSchema = (schema: string) => this.execute(`use schema ${schema}`);
    useRole = (roleName: string) => this.execute(`use role ${roleName}`);

    getTable<T = any>(table: string) {
        return this.execute<T>(`select * from ${table}`);
    }

    /**
     * @method executeAs Switches to a role, executes a query 
     * and then reverts the role change so the session isn't affected
     * @param sql Query
     * @param roleName Name of the role
     */
    executeAs<T = any>(sql: string, roleName: string): QueryResult<T> {

        let state = new StateManager();

        this.useRole(roleName);

        var result = this.execute<T>(sql);
        state.restore();

        return result;

    }
}
