## Complete example
As an example, here's a procedure that assigns a role to users with a certain text in their comment-field (from SHOW USERS). During the procedure we have to execute statements using different roles. Kind of contrived but as an example it'll do just fine. It takes two parameters of type string, and returns an object containing the roleName-parameter and the users it was assigned to. 

```typescript
import { Procedure } from "../lib/procedure/Procedure";
import { SnowflakeClient } from "../lib/core/SnowflakeClient";
import { Rights } from "../lib/procedure/Rights";
import { Arguments } from "../lib/procedure/Arguments";

export class ProcArgs extends Arguments {
    groupName: string;
    roleName: string;
}

export class GrantRoleToGroup extends Procedure {
    rights = Rights.Caller; // Execute procedure as Caller
    args: ProcArgs; // Declare type of Arguments-class, compiler will provide an instance

    // Define procedure logic
    run = () => {
        const client = new SnowflakeClient(); // Create Snowflake client
        
        const users = client
            .executeAs('show users', 'accountadmin') // Retrieve users as accountadmin
            .filter(u => u.comment === this.args.groupName) // Filter retrieved results
            .map(u => u.name); // Select username

        for(const user of users) {
            // Assign role as securityadmin to each user
            client.executeAs(`grant role ${this.args.roleName} to user ${user}`, 'securityadmin'); 
        };

        // return the assigned role and the users it was assigned to
        return  { users: users, assignedRole: this.args.roleName };
    }
}
```