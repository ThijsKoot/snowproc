import { InternalSnowflake } from "../internal/InternalSnowflake";
import { ResultSet } from "./ResultSet";
import { SQLCommand } from "../internal/SqlCommand";

declare var snowflake: InternalSnowflake;

export class SnowflakeClient {
    snowflake: InternalSnowflake;

    constructor() {
        this.snowflake = snowflake;
    }

    execute(sql: string) : ResultSet {
        let command = new SQLCommand (sql);
        let internalResults = this.snowflake.execute(command);

        return new ResultSet(internalResults);
    }
}