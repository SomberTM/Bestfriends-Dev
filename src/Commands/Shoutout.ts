import { MessageEmbed } from 'discord.js';
import {
    Bestfriends,
    BestfriendsGuild,
    BestfriendsRelationship, 
    DefaultBestfriendsRelationship,
    Message,
    GuildMember,
    ms,
    clone
} from '../deps';

export default {
    name: 'Shoutout',
    aliases: [ 'shoutout' ],
    description: `Shoutout a user to increase status`,
    examples: [ `shoutout @<user>` ],
    permissions: [ 'SEND_MESSAGES' ],
    shoutout: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        if (!args[0]) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, '@<user>');
        } if (!message.mentions.members?.first()) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INCORRECT);
        }

        let to: GuildMember = message.mentions.members.first()!;
        let relationship: BestfriendsRelationship | undefined = BestfriendsGuild.relationships.find((relationship: BestfriendsRelationship) => relationship.to == to.user.id && relationship.from == message.author.id);

        if (!relationship) {
            let newRelationship: BestfriendsRelationship = clone(DefaultBestfriendsRelationship);
            newRelationship.to = to.user.id;
            newRelationship.from = message.author.id;
            BestfriendsGuild.relationships.push(newRelationship);
            Bestfriends.log(`Created relationship from ${message.author.tag.cyan} to ${to.user.tag.cyan}`);
            relationship = BestfriendsGuild.relationships.find((relationship: BestfriendsRelationship) => relationship.to == to.user.id && relationship.from == message.author.id)!;
        }
        
        let last_used: number = relationship.cooldowns.callout.last_used;
        let cooldown_time: number = relationship.cooldowns.callout.cooldown_time;

        if (Date.now() - last_used > cooldown_time) {
            //Off cooldown
            relationship.cooldowns.callout.last_used = Date.now();

            let preStatus: number = relationship.status;
            relationship.status += 10;

            message.channel.send(
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setTitle(`${message.member?.displayName} has shouted ${to.displayName} out for being an amazing friend`)
                .addField(`Status Before`, `\`${preStatus}\``, true)
                .addField(`Status After`, `\`${relationship.status}\``, true)
                .setTimestamp()
            )

            await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
        } else {
            //On cooldown
            let cooldown = cooldown_time - (Date.now() - last_used);
            let long: boolean = true;
            return message.channel.send(`Please wait **${ms(cooldown, { long })}** and **${cooldown_time >= 60000 ? ms(cooldown % 60000, { long }) : ms(cooldown % 1000, { long })}** before calling out this person again`);
        }
    }
}