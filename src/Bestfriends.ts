require("dotenv").config();
import { 
    Keyv, 
    Client, 
    ClientOptions, 
    Connect, 
    EventHandler, 
    Emitter,
    Registry,
    colors,
    path,
    BestfriendsGuild,
    save,
    startListeners
} from './deps';

export class Bestfriends {

    public database: Keyv;
    public client: Client;
    public events: Emitter;
    public commands: Registry;
    public embedColor: string;
    
    public log: (...args: any[]) => void;
    public warn: (...args: any[]) => void;
    public error: (...args: any[]) => void;
    public save: (Guild: string, GuildData: BestfriendsGuild) => Promise<BestfriendsGuild>;

    constructor(clientOptions?: ClientOptions) {
        this.client = new Client(clientOptions);
        this.events = new Emitter();
        this.commands = new Registry(path.join(__dirname, 'Commands'));
        this.embedColor = 'd10d1a';
        this.database = Connect();

        this.log = Bestfriends.log;
        this.warn = Bestfriends.warn;
        this.error = Bestfriends.error;
        this.save = async (guildid: string, BestfriendsGuild: BestfriendsGuild): Promise<BestfriendsGuild> => {
            return await save(this, BestfriendsGuild, guildid);
        }

        startListeners(this);
        EventHandler(this);
        this.client.login(process.env.TOKEN);
    }

    public static log(...args: any[]) { console.log(`${`[INFO]:`.gray} ${(args.join('\n').replace(/'/g, colors.gray(`'`))).replace(/database/g, colors.bold('database'))}`) }
    public static warn(...args: any[]) { console.log(`${`[WARN]:`.yellow} ${args.join(' ')}`) }
    public static error(...args: any[]) { console.log(`${`[ERROR]:`.red} ${args.join(' ')}`) }

}