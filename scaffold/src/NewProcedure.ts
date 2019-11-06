import { Procedure, Arguments, Rights, SnowflakeClient } from "snowproc";

class NewProcedureArguments extends Arguments {
}

class NewProcedure extends Procedure {
    rights: Rights.Owner;
    args: NewProcedureArguments;
    
    run = () => {
        const client = new SnowflakeClient();
    }
}