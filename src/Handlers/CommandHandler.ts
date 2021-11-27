import { Message } from 'discord.js';
import {
    Bestfriends,
    BestfriendsGuild,
    Help,
} from '../deps';
import { computePageRank, FLAGS } from '../Utils/PageRank';

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

        case 'convochannels':
        case 'convo-channels':
        case 'coversationchannels':
        case 'conversation-channels':
            Bestfriends.commands.get('GetConversationChannels').get(Bestfriends, BestfriendsGuild, message);
            break;

        case 'callout':
            Bestfriends.commands.get('Callout').callout(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'shoutout':
            Bestfriends.commands.get('Shoutout').shoutout(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'fight':
            Bestfriends.commands.get('Fight').fight(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'top':
            Bestfriends.commands.get('Top').get(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'update':
        case 'force':
        case 'force-update':
            if (message.member?.permissions.has('ADMINISTRATOR') || (message.author.id == '341741687065804812') || (message.author.id == '173942591828525056')) {
                await computePageRank(Bestfriends, BestfriendsGuild, message.guild!.id, FLAGS.INTERACTIVITY);
                Bestfriends.log(`Computed page ranks for '${message.guild?.name.yellow}' by force`);
            } else {
                return message.channel.send(`No`);
            }
            break;

        case 'enableevents':
        case 'enable-events':
            Bestfriends.commands.get('EnableRandomEvents').start(Bestfriends, BestfriendsGuild, message.channel, args);
            break;

        case 'disbaleevents':
        case 'disable-events':
            Bestfriends.commands.get('DisableRandomEvents').disable(Bestfriends, BestfriendsGuild, message);
            break;

        case 'seteventchannel':
        case 'set-event-channel':
            Bestfriends.commands.get('SetEventChannel').set(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'status':
            Bestfriends.commands.get('Status').status(Bestfriends, BestfriendsGuild, message, args);
            break;

        case 'help':
        case 'h':
            Help(Bestfriends, BestfriendsGuild, message, args);
            break;
    }

}