var count = 20;
var cursusnaam = "testcursus";

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

createRoleStatements = [ 'use role securityadmin', 
    'create or replace role cursist', 
    'grant role cursist to role sysadmin',
    'use role sysadmin',
    'grant create warehouse on account to role cursist',
    'grant create database on account to role cursist', 
    'use role securityadmin']

createRoleStatements.forEach(statement => {
    snowflake.execute({sqlText: statement });    
})

for (i = 0; i < count; i++) {
    number = pad(i, 2, 0);
    userName = `${testcursus}${number}`;

    userSql = `create user ${userName} with
    password = 'Snowflake2019!'
    default_role = 'cursist'
    must_change_password = false;`

    grantSql = `grant role cursist to user ${userName}`;
    snowflake.execute( { sqlText: userSql} );
    snowflake.execute(grantSql);

    // adminSql = `insert into table cursus_admin.public.cursisten (cursus, user) values '${cursusnaam}', '${userName}`;   
};