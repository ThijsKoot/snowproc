import { Procedure } from "../lib/procedure/Procedure";
import { Arguments } from "../lib/procedure/Arguments";

class SimpleTestArgs extends Arguments {
    number: number;
}

class SimpleTest extends Procedure {
    args: SimpleTestArgs;
    
    run = () => {
        return this.args.number;
    }
}