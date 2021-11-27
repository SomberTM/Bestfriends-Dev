import { whitelistedChannel } from '../Database/Schemas';
import {
    Bestfriends,
    Message,
    BestfriendsGuild,
    GuildChannel,
    MessageEmbed,
    ARGUMENTS_NONE
} from '../deps';

export default {
    name: 'AddConversationChannel',
    aliases: [ 'addconversation', 'addconversationchannel', 'add-conversation-channel', 'addconvo', 'addconvochannel', 'add-convo-channel'],
    description: `Adds a conversation channel for this guild`,
    examples: [ 'addconvo #<channel>', 'addconvo <channel-id>' ],
    permissions: [ 'MANAGE_CHANNELS' ],
    add: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild,  message: Message, args: string[]) {
        if (!message.member?.permissions.has('MANAGE_CHANNELS')) {
            return Bestfriends.events.emit(Bestfriends.events.PERMISSIONS.MISSING, message, 'MANAGE_CHANNELS');
        }

        if (!args[0]) {
            let error: ARGUMENTS_NONE = {
                example: `${BestfriendsGuild.prefix}addconvo #general | ${BestfriendsGuild.prefix}addconvo 708922295644717159`,
                append_prefix: false,
                missing: [ '#<channel> | <channel-id>' ]
            }
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, message, error);
        }

        let exists: whitelistedChannel | undefined = BestfriendsGuild.whitelistedChannels.find((channel: whitelistedChannel) => channel.id == args[0] || channel.id == message.mentions.channels.first()?.id);
        if (exists) {
            return Bestfriends.events.emit(Bestfriends.events.RESPONSE, message, 
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setAuthor(message.guild?.name, message.guild?.iconURL() || message.author.defaultAvatarURL)
                .setDescription(`\`#${exists.name}\` is already a conversation channel`)
                .setFooter(`ID: ${exists.id}`)
                .setTimestamp()
                )
        }

        let channel: GuildChannel | undefined = undefined;
        if (!message.mentions || !message.mentions.channels || !message.mentions.channels.first()) {
            if (args[0].match(/([0-9])/)) {
                channel = message.guild?.channels.cache.find((channel: GuildChannel) => channel.id == args[0]);
                if (!channel) {
                    return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
                }                 
            } else {
                return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
            }
        } else {
            channel = message.mentions.channels!.first();
        }

        if (channel?.type != "text") {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }

        BestfriendsGuild.whitelistedChannels.push({
            id: channel.id,
            name: channel.name,
            activeUsers: [],
            lastAuthor: ""
        });

        Bestfriends.events.emit(Bestfriends.events.RESPONSE, message, 
            new MessageEmbed()
            .setColor(Bestfriends.embedColor)
            .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
            //.setTitle(`Added Conversation Channel`)
            .addField(`Added Conversation Channel`,`\`#${channel.name}\``, false)
            .addField(`All Conversation Channels [${BestfriendsGuild.whitelistedChannels.length}]`, `${BestfriendsGuild.whitelistedChannels.map((convoChannel: whitelistedChannel) => `\`#${convoChannel.name}\``).join('\n')}`)
            .setTimestamp()
        )

        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
    }
}

function isTextChannel(channel: GuildChannel) {

}