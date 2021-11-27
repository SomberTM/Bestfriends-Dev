import {
    Bestfriends,
    BestfriendsGuild,
    Message,
    MessageEmbed,
    ARGUMENTS_NONE
} from '../deps';

export default {
    name: 'ChangePrefix',
    aliases: [ 'prefix' ],
    description: 'Changes this guilds prefix to the given prefix',
    examples: [ 'prefix !'],
    permissions: [ 'ADMINISTRATOR' ],
    change: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        let oldPrefix: string = BestfriendsGuild.prefix;
        
        if (!args[0]) {
            //Needs argument implementation
            let error: ARGUMENTS_NONE = {
                example: `${BestfriendsGuild.prefix}prefix !`,
                append_prefix: false,
                missing: [ 'new prefix (A-Z)']
            }
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, message, error);
        }

        if (args[0].match(/([0-9])/g)) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }

        let newPrefix: string = args[0];

        BestfriendsGuild.prefix = newPrefix;
        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);

        Bestfriends.events.emit(Bestfriends.events.RESPONSE, message, 
            new MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
            .setColor(Bestfriends.embedColor)
            .setTitle(`Changed prefix!`)
            .addField('Old Prefix', `\`${oldPrefix}\``, true)
            .addField(`New Prefix`, `\`${newPrefix}\``, true)
            .setFooter(Bestfriends.client.user!.tag)
            .setTimestamp()
        )
    }
}