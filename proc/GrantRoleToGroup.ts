import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";
import { Rights } from "../lib/procedure/Rights";
import { Arguments } from "../lib/procedure/Arguments";

export class ProcArgs extends Arguments {
    groupName: string;
    roleName: string;
}

export class GrantRoleToGroup extends Procedure {
    rights = Rights.Caller;
    args: ProcArgs;

    run = () => {
        var client = new SnowflakeClient();
        client.useRole('securityadmin');
        
        var users = client.executeAs('show users', 'accountadmin')
            .filter(u => u.comment === this.args.groupName);

        for(let user of users) {
            client.executeAs(`grant role ${this.args.roleName} to user ${user.name}`, 'securityadmin');
        }

        return  { users: users, assignedRole: this.args.roleName}
    }
}