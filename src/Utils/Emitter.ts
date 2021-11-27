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
            INVALID: 'invalidArguments'
        }
    }

    get PERMISSIONS(): PERMISSIONS {
        return {
            MISSING: 'missingPermissions'
        }
    }

    get PAGEREACTION(): PAGEREACTIONS {
        return {
            CREATE: 'pageReactionCreate'
        }
    }

}

export interface ARGS {
    NONE: string,
    MISSING: string,
    INVALID: string
}

export interface PERMISSIONS {
    MISSING: string
}

export interface PAGEREACTIONS {
    CREATE: string,
}

export interface ARGUMENTS_NONE {
    example: string,
    append_prefix?: boolean,
    missing: string[]
}

export interface ARGUMENTS_MISSING {
    example: string,
    which: string[]
}

export interface ARGUMENTS_INVALID {

}
