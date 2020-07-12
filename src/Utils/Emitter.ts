import { EventEmitter } from 'events';

export class Emitter extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(10);
    }

    get RESPONSE(): string {
        return 'responseMessage';
    }

    get COMMAND_USED(): string {
        return 'commandUsed';
    }

    get ARGUMENTS(): ARGS  {
        return {
            NONE: 'noneArguments',
            MISSING: 'missingArguments',
            INCORRECT: 'incorrectArguments'
        }
    }

}

export interface ARGS {
    NONE: string,
    MISSING: string,
    INCORRECT: string
}