import { Procedure, Arguments } from "snowproc";

class SimpleTestArgs extends Arguments {
    number: number;
}

class SimpleTest extends Procedure {
    args: SimpleTestArgs;
    
    run = () => {
        return this.args.number;
    }
}