import { Statement } from "../internal/Statement";
import { ResultSet } from "../internal/ResultSet";

interface IteratorResult<T> {
    done: boolean;
    value: T;
}

/**
 * @class Result of executing a query
 * @description Contains tools for processing of query results
 */
export class QueryResult<T = any> implements IterableIterator<T> {

    [Symbol.iterator](): IterableIterator<T> {
        return this
    }

    private _filter: (obj: T) => boolean;
    private processedRows: number;

    /**
     * Gets the current row in result set, or undefined if next() has not been called.
     */
    public currentRow: T;

    public queryId: string;

    public rowLimit: number;
    public rowCount: number;
    columns: Array<string>;

    public constructor(
        private internalResults: ResultSet,
        private statement: Statement,
        private type?: new () => T
    ) {
        this.columns = this.loadColumns();
        this.rowCount = this.statement.getRowCount();
        this.queryId = statement.getQueryId();
    }

    private getInstance = () => this.type === undefined
        ? <T>{}
        : new this.type();

    /**
     * Set filter condition to apply to this result set. 
     * Subsequent calls will replace the original filter condition.
     * @example 
     * const filtered = queryResult.filter(example => example.subject == 'filter');
     */
    filter(condition: (row: T) => boolean): QueryResult<T> {
        this._filter = condition;

        return this;
    }

    /**
    * Loops through rows and returns first match for condition
    * @example 
    * const row = queryResult.find(example => example.subject === 'filter');
    */
    find(condition: (row: T) => boolean): T {
        this._filter = condition;

        // iterating already applies filter so the first row we get is the first filter hit
        for (let row of this) {
            return row;
        }
    }

    /**
     * Mimics Array.forEach(), executes an action for each row
     * @param action action to execute for each row
     * @example 
     * client
     *     .execute('show warehouses')
     *     .forEach(row => doSomething(row))
     */
    public forEach(action: (row: T) => void): void {
        for (let row of this) {
            action(row);
        }
    }

    /**
     * Mimics Array.map(). Equivalent to calling .materialize().map();
     * @param mapping 
     */
    public map<TNew>(mapping: (obj: T) => TNew) {
        return this.materialize().map(mapping);
    }

    /**
    * @description maps column value to an object instance
    * 
    * Snowflake returns column names in all-caps so this matches
    * column names by querying object keys
    * @param instance Object instance 
    * @param col Name of the column to retrieve
    */
    private mapProperty = (instance: T, col: string): T => {
        let prop = Object.keys(instance)
            .filter(p => instance.hasOwnProperty(p))
            .find(p => p.toUpperCase() === col)

        if (prop !== undefined) {
            instance[prop] = this.internalResults[col]
        }

        else {
            instance[col.toLowerCase()] = this.internalResults[col];
        }

        return instance;
    }

    /**
     * Load entire result set to array
     * @example 
     * var snowflake = new SnowflakeClient();
     * var results = snowflake
     *     .execute<string>('select col from tbl'))
     *     .materialize();
     */
    public materialize() {
        return Array.from(this);
    }

    /**
     * @description Set max amount of rows this QueryResult returns
     * @argument limit Row limit
     */
    public limit(limit: number): QueryResult<T> {
        this.rowLimit = limit;

        return this;
    }

    /**
     * @description Map columns from internal result set to an instance of T
     */
    private getRow() {
        return this.columns.reduce<T>((row, col) => this.mapProperty(row, col), this.getInstance());
    }

    private rowLimitReached = () => this.rowLimit !== undefined && this.processedRows === this.rowLimit;

    /**
     * @description implementation of iterator. Iterates until row limit is reached. 
     * If filter is set, this recurses until the condition is met.
     * 
     * @returns IteratorResult<T> 
     */
    public next(): IteratorResult<T> {
        if (!this.rowLimitReached() && this.internalResults.next()) {
            let currentRow = this.getRow();

            this.processedRows++;

            if (this._filter !== undefined && !this._filter(currentRow)) {
                return this.next(); // recurse until filter returns true
            }

            this.currentRow = currentRow;

            return {
                done: false,
                value: currentRow
            }
        }
        return {
            done: true,
            value: null
        }
    }

    /**
     * Retrieve column names from internal result set
     */
    private loadColumns(): Array<string> {
        let columnCount = this.statement.getColumnCount();
        let columnNames = Array<string>();

        for (let i = 1; i <= columnCount; i++) {
            let name = this.statement.getColumnName(i);
            columnNames.push(name);
        }

        return columnNames;
    }
}
