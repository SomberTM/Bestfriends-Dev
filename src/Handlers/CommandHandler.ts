import { Message } from 'discord.js';
import {
    Bestfriends,
    BestfriendsGuild,
} from '../deps';

export async function CommandHandler(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[], cmd: string) {

    let flags: string[] = args.filter((arg: string) => arg.startsWith('--'));

    switch(cmd) {

        //Clear is dev only, somber & jack
        case 'clear':
        case 'cleardb':
        case 'cleardatabase':
            Bestfriends.commands.get('ClearDatabase').clear(Bestfriends, message, flags);
            break;

        case 'prefix':
            Bestfriends.commands.get('ChangePrefix').change(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'addconvo':
        case 'addconvochannel':
        case 'addconversation':
        case 'add-convo-channel':
        case 'addconversationchannel':
        case 'add-conversation-channel':
            Bestfriends.commands.get('AddConversationChannel').add(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'callout':
            Bestfriends.commands.get('Callout').callout(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'shoutout':
            Bestfriends.commands.get('Shoutout').shoutout(Bestfriends, BestfriendsGuild, message, args);
    }

}