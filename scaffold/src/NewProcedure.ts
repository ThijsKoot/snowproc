import { Procedure, Arguments, Rights, SnowflakeClient } from "snowproc";

class NewProcedureArguments extends Arguments {
}

class NewProcedure extends Procedure {
    rights = Rights.Owner;
    
    run = (client: SnowflakeClient, args: NewProcedureArguments) => {
    }
}