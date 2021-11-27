import { GuildMember, MessageEmbed } from 'discord.js';
import { BestfriendsRelationship, BestfriendsUser } from '../Database/Schemas';
import { findRelationship, findUser } from '../Database/Utils';
import { 
    Bestfriends,
    BestfriendsGuild,
    Message 
} from '../deps';

export default {
    name: 'Status',
    aliases: [ 'status' ],
    description: 'Get the status between you and the target user, or your net status if no user is specified',
    examples: [ 'ststus', 'status @<user>' ],
    permissions: [],
    status: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {

        if (!message.mentions.members?.first()) {
            let user: BestfriendsUser = findUser(BestfriendsGuild, message.author.id);
            message.channel.send(
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
                .setDescription(`Net status is the sum of all your relationships statuses`)
                .addField(`Your net status`, `\`${user.netStatus}\``)
                .setTimestamp()
            )
        } else {
            let mentioned: GuildMember = message.mentions.members.first()!;
            let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, mentioned.user.id, message.author.id);
            message.channel.send(
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
                .setDescription(`Status between two users can be increased or decreased through the Fight, Callout, and Shoutout commands or through Random Events`)
                .addField(`Status from ${message.member?.displayName} to ${mentioned.displayName}`, `\`${relationship.status}\``)
                .setTimestamp()
            )
        }

    }
}