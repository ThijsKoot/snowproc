import { Arguments } from "./Arguments";
import { Rights } from "./Rights";

export abstract class Procedure {

    name: string;
    returnValue: any;
    canReturnNull: boolean = true;
    args: Arguments;
    rights: Rights = Rights.Owner;
    restoreState: boolean = true;

    run: () => void;
}