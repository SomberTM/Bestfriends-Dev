import { whitelistedChannel } from '../Database/Schemas';
import {
    Bestfriends,
    Message,
    BestfriendsGuild,
    GuildChannel,
    MessageEmbed
} from '../deps';

export default {
    name: 'AddConversationChannel',
    aliases: [ 'addconversation', 'addconversationchannel', 'add-conversation-channel', 'addconvo', 'addconvochannel', 'add-convo-channel'],
    description: `Adds a conversation channel for this guild`,
    examples: [ 'addconvo @<channel>', 'addconvo <channel-id>' ],
    permissions: [ 'ADMINISTRATOR' ],
    add: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild,  message: Message, args: string[]) {
        if (!args[0]) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, '@channel / channel-id');
        }
        
        let channel: GuildChannel | undefined = undefined;
        if (!message.mentions || !message.mentions.channels || !message.mentions.channels.first()) {
            if (args[0].match(/([0-9])/)) {
                channel = message.guild?.channels.cache.find((channel: GuildChannel) => channel.id == args[0]);
                
                if (!channel) {
                    return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INCORRECT);
                } 
                
            } else {
                return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INCORRECT);
            }
        } else {
            channel = message.mentions.channels!.first();
        }

        if (channel?.type != "text") {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INCORRECT);
        }

        BestfriendsGuild.whitelistedChannels.push({
            id: channel.id,
            name: channel.name,
            activeUsers: [],
            lastAuthor: ""
        });

        Bestfriends.events.emit(Bestfriends.events.RESPONSE, message, 
            new MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
            .setTitle(`Added Conversation Channel`)
            .addField(`Channel`,`\`${channel.name}\``, true)
            .addField(`All Conversation Channels`, `${BestfriendsGuild.whitelistedChannels.map((convoChannel: whitelistedChannel) => `\`${convoChannel.name}\``)}`)
            .setTimestamp()
        )

        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
    }
}

function isTextChannel(channel: GuildChannel) {

}