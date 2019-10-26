// lambdas
const execute = (sql) => snowflake.execute({ sqlText: sql });
const useRole = (role) => execute(`use role ${role}`);
const show = (item) => execute(`show ${item} in account`);
const drop = (objectName, objectType) => execute(`drop ${objectType} ${objectName}`);

function executeObjectArray(sql) {
    let statement = snowflake.createStatement({ sqlText: sql })
    let resultSet = statement.execute();

    let columnCount = statement.getColumnCount();

    columnNames = [];

    for (i = 1; i <= columnCount; i++) {
        let name = statement.getColumnName(i);
        columnNames.push(name);
    }

    let results = [];

    while (resultSet.next()) {
        let result = {}
        columnNames.forEach(key => result[key.toLowerCase()] = resultSet.getColumnValue(key));
        results.push(result);
    }

    return results;
}

class StateManager {
    constructor() {
        this.state = { role: '', database: '', schema: '' };
        this.getCurrentState();
    }

    getCurrentState() {
        Object.keys(this.state).forEach(prop => {
            let results = execute(`select current_${prop}()`);
            if (results.next()) {
                this.state[prop] = results.getColumnValue(1);
            }
        });
    };

    restoreState() {
        Object.keys(this.state)
            .forEach(prop => execute(`use ${prop} ${this.state[prop]}`))
    };
}


// Save current state
const state = new StateManager();

// drop users first
const userSql = `select username from cursus_admin.public.users 
                 where lower(prefix) = '${PREFIX.toLowerCase()}'`;

const users = executeObjectArray(userSql).map(x => x.username);

users.forEach(user => {
    useRole('securityadmin');
    drop(user, 'user');
    useRole('sysadmin');
    execute(`delete from cursus_admin.public.users where username = '${user}'`);
});

const ownerRole = `${PREFIX.toUpperCase()}_ROLE`;
const ownedItems = (item) => item.owner === ownerRole

useRole('sysadmin');
const warehouses = executeObjectArray('show warehouses in account')
    .filter(ownedItems);

const databases = executeObjectArray('show databases in account')
    .filter(ownedItems);

warehouses.forEach(x => drop(x.name, 'warehouse'));
databases.forEach(x => drop(x.name, 'database'));

useRole('securityadmin');
drop(ownerRole, 'role');

state.restore();

return { droppedUsers: users, droppedDatabases: databases, droppedWarehouses: warehouses };