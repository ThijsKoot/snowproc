[snowflakeproc](../README.md) › [Globals](../globals.md) › ["lib/core/QueryResult"](../modules/_lib_core_queryresult_.md) › [QueryResult](_lib_core_queryresult_.queryresult.md)

# Class: QueryResult <**T**>

**`class`** Result of executing a query

**`description`** Contains tools for processing of query results

## Type parameters

▪ **T**

## Hierarchy

* **QueryResult**

## Implements

* IterableIterator‹T›

## Index

### Constructors

* [constructor](_lib_core_queryresult_.queryresult.md#constructor)

### Properties

* [_filter](_lib_core_queryresult_.queryresult.md#private-_filter)
* [columns](_lib_core_queryresult_.queryresult.md#columns)
* [currentRow](_lib_core_queryresult_.queryresult.md#currentrow)
* [processedRows](_lib_core_queryresult_.queryresult.md#private-processedrows)
* [queryId](_lib_core_queryresult_.queryresult.md#queryid)
* [results](_lib_core_queryresult_.queryresult.md#private-results)
* [rowCount](_lib_core_queryresult_.queryresult.md#rowcount)
* [rowLimit](_lib_core_queryresult_.queryresult.md#rowlimit)
* [statement](_lib_core_queryresult_.queryresult.md#private-statement)

### Methods

* [__@iterator](_lib_core_queryresult_.queryresult.md#__@iterator)
* [filter](_lib_core_queryresult_.queryresult.md#filter)
* [forEach](_lib_core_queryresult_.queryresult.md#foreach)
* [getRow](_lib_core_queryresult_.queryresult.md#private-getrow)
* [limit](_lib_core_queryresult_.queryresult.md#limit)
* [loadColumns](_lib_core_queryresult_.queryresult.md#private-loadcolumns)
* [map](_lib_core_queryresult_.queryresult.md#map)
* [mapProperty](_lib_core_queryresult_.queryresult.md#private-mapproperty)
* [materialize](_lib_core_queryresult_.queryresult.md#materialize)
* [next](_lib_core_queryresult_.queryresult.md#next)

## Constructors

###  constructor

\+ **new QueryResult**(`internalResults`: [ResultSet](../interfaces/_lib_internal_resultset_.resultset.md), `statement`: [Statement](../interfaces/_lib_internal_statement_.statement.md)): *[QueryResult](_lib_core_queryresult_.queryresult.md)*

**Parameters:**

Name | Type |
------ | ------ |
`internalResults` | [ResultSet](../interfaces/_lib_internal_resultset_.resultset.md) |
`statement` | [Statement](../interfaces/_lib_internal_statement_.statement.md) |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)*

## Properties

### `Private` _filter

• **_filter**: *function*

#### Type declaration:

▸ (`obj`: T): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | T |

___

###  columns

• **columns**: *Array‹string›*

___

###  currentRow

• **currentRow**: *T*

Gets the current row in result set, or undefined if next() has not been called.

___

### `Private` processedRows

• **processedRows**: *number*

___

###  queryId

• **queryId**: *string*

___

### `Private` results

• **results**: *[ResultSet](../interfaces/_lib_internal_resultset_.resultset.md)*

___

###  rowCount

• **rowCount**: *number*

___

###  rowLimit

• **rowLimit**: *number*

___

### `Private` statement

• **statement**: *[Statement](../interfaces/_lib_internal_statement_.statement.md)*

## Methods

###  __@iterator

▸ **__@iterator**(): *IterableIterator‹T›*

**Returns:** *IterableIterator‹T›*

___

###  filter

▸ **filter**(`condition`: function): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

Set filter condition to apply to this result set.
Subsequent calls will replace the original filter condition.

**`example`** 
const filtered = queryResult.filter(example => example.subject == 'filter');

**Parameters:**

▪ **condition**: *function*

▸ (`row`: T): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`row` | T |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

___

###  forEach

▸ **forEach**(`action`: function): *void*

**Parameters:**

▪ **action**: *function*

▸ (`row`: any): *void*

**Parameters:**

Name | Type |
------ | ------ |
`row` | any |

**Returns:** *void*

___

### `Private` getRow

▸ **getRow**(): *T*

**`description`** Map columns from internal result set to an instance of T

**Returns:** *T*

___

###  limit

▸ **limit**(`limit`: number): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

**`description`** Set max amount of rows this QueryResult returns

**`argument`** limit Row limit

**Parameters:**

Name | Type |
------ | ------ |
`limit` | number |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

___

### `Private` loadColumns

▸ **loadColumns**(): *Array‹string›*

Retrieve column names from internal result set

**Returns:** *Array‹string›*

___

###  map

▸ **map**<**TNew**>(`mapping`: function): *TNew[]*

Mimics Array.map(). Equivalent to calling .materialize().map();

**Type parameters:**

▪ **TNew**

**Parameters:**

▪ **mapping**: *function*

▸ (`obj`: T): *TNew*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | T |

**Returns:** *TNew[]*

___

### `Private` mapProperty

▸ **mapProperty**(`instance`: T, `col`: string): *T*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`instance` | T | Object instance |
`col` | string | Name of the column to retrieve  |

**Returns:** *T*

___

###  materialize

▸ **materialize**(): *T[]*

Load entire result set to array

**`example`** 
var snowflake = new SnowflakeClient();
var results = snowflake
    .execute<string>('select col from tbl'))
    .materialize();

**Returns:** *T[]*

___

###  next

▸ **next**(): *[IteratorResult](../interfaces/_lib_core_queryresult_.iteratorresult.md)‹T›*

**`description`** implementation of iterator. Iterates until row limit is reached.
If filter is set, this recurses until the condition is met.

**Returns:** *[IteratorResult](../interfaces/_lib_core_queryresult_.iteratorresult.md)‹T›*

IteratorResult<T>
