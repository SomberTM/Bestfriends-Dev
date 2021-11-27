import {
    Bestfriends,
    Message,
    BestfriendsGuild,
    whitelistedChannel,
    MessageEmbed
} from '../deps';

export default {
    name: 'GetConversationChannels',
    aliases: [ 'convochannels', 'convo-channels', 'coversationchannels', 'conversation-channels'],
    description: 'Displays all the conversation channels for this server',
    examples: [ 'convochannels' ],
    permissions: [ "VIEW_CHANNELS" ],
    get: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild,  message: Message) {
        message.channel.send(
            new MessageEmbed()
            .setColor(Bestfriends.embedColor)
            .setAuthor(message.guild?.name, message.guild?.iconURL() || message.author.defaultAvatarURL)
            .setTitle(`Conversation Channels [${BestfriendsGuild.whitelistedChannels.length}]`)
            .setDescription(BestfriendsGuild.whitelistedChannels.map((channel: whitelistedChannel) => `• \`#${channel.name} - ${channel.id}\``))
            //.setFooter(`Total: ${BestfriendsGuild.whitelistedChannels.length}`)
            .setTimestamp()
        )
    }
}