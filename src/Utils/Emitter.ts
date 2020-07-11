import { EventEmitter } from 'events';

export class Emitter extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(10);
    }

}