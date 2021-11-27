import {
    Bestfriends,
    BestfriendsGuild,
    BestfriendsRelationship, 
    Message,
    MessageEmbed,
    GuildMember,
    ms,
    BestfriendsUser,
    findRelationship, 
    findUser,
    ARGUMENTS_NONE
} from '../deps';

export default {
    name: 'Callout',
    aliases: [ 'callout' ],
    description: `Callout a user to decrease status`,
    examples: [ `callout @<user>` ],
    permissions: [ 'SEND_MESSAGES' ],
    callout: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        if (!args[0]) {
            let error: ARGUMENTS_NONE = {
                example: `${BestfriendsGuild.prefix}callout @Somber#6753`,
                append_prefix: false,
                missing: [ '@<user>' ]
            }
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, message, error);
        } if (!message.mentions.members?.first()) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }

        let to: GuildMember = message.mentions.members.first()!;
        let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, to.user.id, message.author.id);
        
        let last_used: number = relationship.cooldowns.callout.last_used;
        let cooldown_time: number = relationship.cooldowns.callout.cooldown_time;

        if (Date.now() - last_used > cooldown_time) {
            //Off cooldown
            relationship.cooldowns.callout.last_used = Date.now();

            let preStatus: number = relationship.status;
            relationship.status -= 10;

            let bestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild, relationship.to);

            bestfriendsUser!.netStatus -= 10;

            message.channel.send(
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setTitle(`${message.member?.displayName} has called out ${to.displayName} for being a bad friend`)
                .addField(`Relationship Status Before`, `\`${preStatus}\``, true)
                .addField(`Relationship Status After`, `\`${relationship.status}\``, true)
                .setTimestamp()
            )

            await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
        } else {
            //On cooldown
            let cooldown = cooldown_time - (Date.now() - last_used);
            let long: boolean = true;
            return message.channel.send(`Please wait **${cooldown >= 86400000 ? ms(cooldown % 86400000, { long }) : ms(cooldown, { long })}** and **${cooldown_time >= 60000 ? ms(cooldown % 60000, { long }) : ms(cooldown % 1000, { long })}** before calling out this person again`);
        }
    }
}