import { ClearGuild, ClearGuildAndRepopulate } from '../Database/Clear';
import {
    Bestfriends,
    Message,
    ClearDatabase,
    ClearDatabaseAndRepopulate,
    Permissions
} from '../deps';

export default {
    name: 'ClearDatabase',
    aliases: [ 'clear', 'cleardb', 'cleardatabase' ],
    description: 'Clears the database and repopulates if the --repop or --repopulate flag is present. Clears all databases, unless --this flag is on. If --this flag is on, then only clear db for this server',
    //Need to prefex with guilds prefix for examples 
    examples: [ 'clear', 'clear --repop', 'clear --repopulate', 'clear --this', 'clear --this --repop', 'clear --this --repopulate' ],
    permissions: [ 'DEV ONLY' ],
    clear: async function(Bestfriends: Bestfriends, message: Message, flags: string[]) {
        if ((message.author.id == '341741687065804812') || (message.author.id == '173942591828525056')) {
            let repop_flag: string | undefined = undefined;
            let this_flag: string | undefined = undefined;
            if (flags.length) repop_flag = flags.find((flag: string) => flag.toLowerCase() == '--repop' || flag.toLowerCase() == '--repopulate');
            if (flags.length) this_flag = flags.find((flag: string) => flag.toLowerCase() == '--this');

            //Clear all no repop
            if (!repop_flag && !this_flag) {
                await ClearDatabase(Bestfriends);
                message.channel.send(`Cleared the database`);

            //Clear this no repop
            } else if (!repop_flag && this_flag) {
                await ClearGuild(Bestfriends, message.guild!.id);
                message.channel.send(`Cleared this server from the database`);

            //Repop all
            } else if (repop_flag && !this_flag) {
                await ClearDatabaseAndRepopulate(Bestfriends);
                message.channel.send(`Cleared the database and repopulated it with default values`);

            //Repop this
            } else if (repop_flag && this_flag) {
                await ClearGuildAndRepopulate(Bestfriends, message.guild!);
                message.channel.send(`Cleared this server from the database and repopulated it with default values`);
            }
        } else {
            return message.channel.send(`No, you cannot use this ))`);
        }
    }
}