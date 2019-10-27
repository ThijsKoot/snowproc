import { InternalResultSet } from "../internal/InternalResultSet";

export class ResultSet {
    private internalResults: InternalResultSet;
    private _filter :  (obj: any) => boolean;

    columns: Array<string>;

    constructor(internalResults: InternalResultSet) {
        this.internalResults = internalResults;

        this.columns = this.getColumns(internalResults);
    }

    filter(filter: (obj: any) => boolean) {
        this._filter = filter;
    }

    materialize(): Array<any> {
        let results = Array<any>();

        while(this.internalResults.next()) {

        }

        return results;
    };

    private getColumns(results: InternalResultSet) {
        let columnCount = results.getColumnCount();
        let columnNames = Array<string>();

        for (let i = 1; i <= columnCount; i++) {
            let name = results.getColumnName(i);
            columnNames.push(name);
        }

        return columnNames;
    }



}