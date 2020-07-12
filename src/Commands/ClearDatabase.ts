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
    description: 'Clears the database and repopulates if the --repop or --repopulate flag is present',
    //Need to prefex with guilds prefix for examples 
    examples: [ 'clear', 'clear --repop', 'clear --repopulate' ],
    permissions: [ 'DEV ONLY' ],
    clear: async function(Bestfriends: Bestfriends, message: Message, flags: string[]) {
        if ((message.author.id == '341741687065804812') || (message.author.id == '173942591828525056')) {
            let repop_flag: string | undefined = undefined;
            if (flags.length) repop_flag = flags.find((flag: string) => flag.toLowerCase() == '--repop' || flag.toLowerCase() == '--repopulate');
            if (!repop_flag) {
                await ClearDatabase(Bestfriends);
                message.channel.send(`Cleared the database`);
            } else {
                await ClearDatabaseAndRepopulate(Bestfriends);
                message.channel.send(`Cleared the database and repopulated it with default values`);
            }
        } else {
            return message.channel.send(`No, you cannot use this ))`);
        }
    }
}