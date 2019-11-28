import { Arguments } from "./Arguments";
import { Rights } from "./Rights";
import { SnowflakeClient } from "../core/SnowflakeClient";

export abstract class Procedure {
   
    name: string; // Not active yet
    canReturnNull: boolean = true; // Not active yet
    restoreState: boolean = true; // Not active yet

    /**
     * @property Holds procedure parameters
     */
    args: Arguments; 

    /**
     * @property Execute procedure with rights of caller or owner. Defaults to owner.
     */
    rights: Rights = Rights.Owner;

    /**
     * @property Code that is run in procedure
     */
    run : (client: SnowflakeClient, args: any) => any;
}