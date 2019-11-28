import { SnowflakeClient, Procedure } from "snowproc";

class SimpleTest extends Procedure {
    run = (client: SnowflakeClient, args: {number: Number}) => {
        return args.number;
    }
}