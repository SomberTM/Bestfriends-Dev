require("dotenv").config();
import { 
    Keyv, 
    Client, 
    ClientOptions, 
    Connect, 
    EventHandler, 
    Emitter 
} from './deps';

export class Bestfriends {

    public database: Keyv;
    public client: Client;
    public events: Emitter;
    
    public log: (...args: any[]) => void;

    constructor(clientOptions?: ClientOptions) {
        this.client = new Client(clientOptions);
        this.events = new Emitter();
        this.database = Connect(this);

        this.log = (...args: any[]) => { console.log(`[INFO]: ${args.join(' ')}`) }

        EventHandler(this);
        this.client.login(process.env.TOKEN);
    }

}