import { SQLCommand } from "./SqlCommand";
import { InternalStatement } from "./InternalStatement";
import { InternalResultSet } from "./InternalResultSet";

export interface InternalSnowflake {
    createStatement(command: SQLCommand) : InternalStatement
    execute(command: SQLCommand) : InternalResultSet
}