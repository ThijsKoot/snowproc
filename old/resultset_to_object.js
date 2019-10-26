function createObjectArray(statement) {
    var columnCount = statement.getColumnCount();
    var columnNames = [];

    for(i = 1; i <= columnCount; i++) {
        var name = statement.GetColumnName(i);
        columnNames.push(name);
    }

    var resultSet = statement.execute();
    var results = [];

    while(resultSet.next()) {
        var result = { }
        columnNames.forEach(key => result[key] = resultSet.getColumnValue(key));
        results.push(result);
    }

    return results;
}