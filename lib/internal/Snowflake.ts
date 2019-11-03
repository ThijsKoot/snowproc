import { SQLCommand } from "./SqlCommand";
import { Statement } from './Statement';
import { ResultSet } from "./ResultSet";

export interface Snowflake {
    createStatement(command: SQLCommand): Statement
    execute(command: SQLCommand): ResultSet
}
