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
     * @param sql Query  
     * @param type Type for generic QueryResult, leave blank for `any`
     * @example 
     * let result = client.execute('sql');
     * let genericResult = client.execute('sql', SomeClass)
     */
    execute<T = any>(sql: string, type? : new () => T): QueryResult<T> {
        let command = new SQLCommand(sql);
        let statement = this.snowflake.createStatement(command);
        let internalResults = statement.execute();

        return new QueryResult<T>(internalResults, statement, type);
    }

    /**
     * @method useDatabase Switches the session to a new database.
     * Doesn't work for procedures with owner's rights.
     */
    useDatabase = (database: string) => this.execute(`use database ${database}`);

    /**
     * @method useSchema Switches the session to a new schema.
     * Doesn't work for procedures with owner's rights.
     */
    useSchema = (schema: string) => this.execute(`use schema ${schema}`);

    /**
     * @method useRole Switches the session to a new role. 
     * Doesn't work for procedures with owner's rights.
     */
    useRole = (roleName: string) => this.execute(`use role ${roleName}`);

    /**
     * @method getTable Selects all rows from a table
     * @param table table name (optionally fully qualified) 
     * @example
     * const myTable = client.getTable('mytable');
     * const myQualifiedTable = client.getTable('mydb.myschema.mytable')
     */
    getTable<T = any>(table: string, type? : new () => T) {
        return this.execute<T>(`select * from ${table}`, type);
    }

    /**
     * @method executeAs Switches to a role, executes a query 
     * and then reverts the role change so the session isn't affected. 
     * Doesn't work for procedures with owner's rights.
     * @param roleName Name of the role
     * @param sql Query
     * @param type Type for generic QueryResult, leave blank for `any`
     */
    executeAs<T = any>(roleName: string, sql: string, type? : new () => T): QueryResult<T> {
        let state = new StateManager();

        this.useRole(roleName);

        var result = this.execute<T>(sql, type);
        state.restore();

        return result;
    }

    drop = (objectName: string, objectType: string) => this.execute(`drop ${objectType} ${objectName}`);
}