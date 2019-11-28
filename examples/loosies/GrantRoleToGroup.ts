import { Procedure, Rights, SnowflakeClient } from "snowproc";

export class GrantRoleToGroup extends Procedure {
    rights = Rights.Caller;

    run = (client, args: {
        groupName: string;
        roleName: string;
    }) => {
        var client = new SnowflakeClient();
        client.useRole('securityadmin');

        var users = client.executeAs('show users', 'accountadmin')
            .filter(u => u.comment === args.groupName);

        for (let user of users) {
            client.executeAs(`grant role ${args.roleName} to user ${user.name}`, 'securityadmin');
        }

        return { users: users, assignedRole: args.roleName }
    }
}