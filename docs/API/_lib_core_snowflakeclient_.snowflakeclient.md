# Class: SnowflakeClient

## Hierarchy

* **SnowflakeClient**

## Index

### Constructors

* [constructor](_lib_core_snowflakeclient_.snowflakeclient.md#constructor)

### Properties

* [snowflake](_lib_core_snowflakeclient_.snowflakeclient.md#snowflake)

### Methods

* [execute](_lib_core_snowflakeclient_.snowflakeclient.md#execute)
* [executeAs](_lib_core_snowflakeclient_.snowflakeclient.md#executeas)
* [getTable](_lib_core_snowflakeclient_.snowflakeclient.md#gettable)
* [useDatabase](_lib_core_snowflakeclient_.snowflakeclient.md#usedatabase)
* [useRole](_lib_core_snowflakeclient_.snowflakeclient.md#userole)
* [useSchema](_lib_core_snowflakeclient_.snowflakeclient.md#useschema)

## Constructors

###  constructor

\+ **new SnowflakeClient**(): *[SnowflakeClient](_lib_core_snowflakeclient_.snowflakeclient.md)*

**Returns:** *[SnowflakeClient](_lib_core_snowflakeclient_.snowflakeclient.md)*

## Properties

###  snowflake

• **snowflake**: *[Snowflake](../interfaces/_lib_internal_snowflake_.snowflake.md)*

## Methods

###  execute

▸ **execute**<**T**>(`sql`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

**`method`** execute Run a query and return a `QueryResult` mapped to `T`

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`sql` | string | Query  |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

___

###  executeAs

▸ **executeAs**<**T**>(`sql`: string, `roleName`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

**`method`** executeAs Switches to a role, executes a query
and then reverts the role change so the session isn't affected.
Doesn't work for procedures with owner's rights.

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`sql` | string | Query |
`roleName` | string | Name of the role   |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

___

###  getTable

▸ **getTable**<**T**>(`table`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

**`method`** getTable Selects all rows from a table

**`example`** 
```typescript
const myTable = client.getTable('mytable');
const myQualifiedTable = client.getTable('mydb.myschema.mytable')
```

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`table` | string | table name (optionally fully qualified) |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹T›*

___

###  useDatabase

▸ **useDatabase**(`database`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*

**Parameters:**

Name | Type |
------ | ------ |
`database` | string |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*

___

###  useRole

▸ **useRole**(`roleName`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*

**Parameters:**

Name | Type |
------ | ------ |
`roleName` | string |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*

___

###  useSchema

▸ **useSchema**(`schema`: string): *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*

**Parameters:**

Name | Type |
------ | ------ |
`schema` | string |

**Returns:** *[QueryResult](_lib_core_queryresult_.queryresult.md)‹any›*
