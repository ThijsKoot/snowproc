export interface ResultSet {

    getColumnCount(): number;

    getColumnName(index: number): string;

    getColumnScale(index: number): any;

    getColumnSqlType(index: number): string;
    getColumnSqlType(name: string): string;

    getColumnType(index: number): string;
    getColumnType(name: string): string;

    getColumnValue(index: number): string,
    getColumnValue(name: string): string,

    getColumnValueAsString(index: number): string;
    getColumnValueAsString(name: string): string;

    getQueryId(): string;

    isColumnArray(index: number): boolean;
    isColumnBinary(index: number): boolean;
    isColumnbooleanean(index: number): boolean;
    isColumnDate(index: number): boolean;
    isColumnNullable(index: number): boolean;
    isColumnNumber(index: number): boolean;
    isColumnObject(index: number): boolean;
    isColumnText(index: number): boolean;
    isColumnTime(index: number): boolean;
    isColumnTimestamp(index: number): boolean;
    isColumnVariant(index: number): boolean;

    next(): boolean;
}