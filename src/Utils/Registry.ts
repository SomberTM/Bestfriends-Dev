import { 
    fs, 
    path, 
    Bestfriends,  
    PermissionResolvable
} from '../deps';

export class Registry {

    public commands: any[] = [];
    public helpers: Helper[] = [];

    constructor(commandsPath: string) {
        const commandFiles: string[] = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const commandFile: any = require(path.join(commandsPath, file)).default;

            this.handleRegistrationError(file, commandFile);

            let command_entry: any = {};
            command_entry[commandFile.name] = commandFile;

            //Get the helper data
            let helper_entry: Helper = {
                name: commandFile.name,
                aliases: commandFile.aliases,
                description: commandFile.description,
                examples: commandFile.examples,
                permissions: commandFile.permissions
            }

            this.helpers.push(helper_entry);
            this.commands.push(command_entry);
        }
    }

    private handleRegistrationError(file: string , command: any) {
        if (typeof command != "object") {
            const e: Error = new Error(`Default export in '${file.red}' must be an object with the properties name, aliases, description, example`)
            Bestfriends.error(e.message.replace('Error:', ''));
            throw e;
        }

        let missing_properties: string[] = [];

        if (!command.name) {
            missing_properties.push("name");
        }

        if (!command.aliases) {
            missing_properties.push("aliases");     
        }

        if (!command.description) {
            missing_properties.push("description");
        }

        if (!command.examples) {
            missing_properties.push("examples");
        }

        if (!command.permissions) {
            missing_properties.push("permissions");
        }

        if (missing_properties.length) {
            const e: Error = new Error(`Missing ${missing_properties.map((property: string) => `${property.red}`)} ${missing_properties.length == 1 ? 'property' : 'properties'} in '${file.red}'`)
            Bestfriends.error(e.message.replace('Error:', ''));
            throw e;
        }
    }

    public get(command_name: string): any {
        if (!this.commands.length) return undefined;
        for (const cmd of this.commands) {
            if (cmd[command_name]) {
                return cmd[command_name];
            }
        }
    }

    public getHelp(command_name: string): Helper | undefined {
        for (const help of this.helpers) {
            if (help.name == command_name) {
                return help;
            }
        }
        return undefined;
    }

    public getAllHelp(): Helper[] {
        return this.helpers;
    }

}

export interface Helper {
    name: string,
    aliases: string[],
    description: string,
    examples: string[],
    permissions: PermissionResolvable[]
    [key: string]: string | string[] | PermissionResolvable[]
}
