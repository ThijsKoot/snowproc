import { State } from './State';
import { SnowflakeClient } from "./SnowflakeClient";

export class StateManager {
    state: State;
    snowflake: SnowflakeClient;

    constructor() {
        this.state = { role: '', database: '', schema: '' };
        this.snowflake = new SnowflakeClient();

        this.state = this.getCurrent();
    }

    getCurrent(): State {
        let state = new State();

        for (const prop in state) {
            if (state.hasOwnProperty(prop)) {
                state[prop] = this.snowflake
                    .execute(`select current_${prop}() as current`)
                    .materialize()
                    .pop()
                    .current;
            }
        }
        return state;
    }

    restore(state?: State) {
        state = state || this.state;
        
        this.snowflake.execute(`use role ${state.role}`)
        this.snowflake.execute(`use database ${state.database}`)
        this.snowflake.execute(`use schema ${state.schema}`)
    }
}


