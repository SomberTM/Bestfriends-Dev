import {
    Bestfriends,
    BestfriendsGuild,
    Message
} from '../deps';

export default {
    name: 'DisableRandomEvents',
    aliases: ['disableevents', 'disable-events'],
    description: `Disables random events if they are enabled`,
    examples: [ 'disableevents' ] ,
    permissions: [ "ADMINISTRATOR" ],
    disable: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message) {
        BestfriendsGuild.randomEvents.enabled = false;
        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
        Bestfriends.log(`Disabled random events for '${message.guild!.name.yellow}'`);
        message.channel.send(`Disabled random events if they were enabled ❤✅!`);
    }
}