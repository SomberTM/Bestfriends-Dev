import {  } from '../Database/Utils';
import {
    Bestfriends,
    BestfriendsGuild,
    addBuff, 
    findRelationship, 
    findUser,
    Message,
    GuildMember,
    BestfriendsRelationship, 
    Buffs, 
    Collection, 
    MessageEmbed, 
    MessageReaction,
    ReactionCollector, 
    User,
    ms, 
    BestfriendsUser, 
} from '../deps';
import { sleep } from '../Utils/Misc';

export default {
    name: 'Fight',
    aliases: [ 'fight' ],
    description: `Fight a user. Out come depends whether you lose or gain status!`,
    examples: [ 'fight @<user>' ],
    permissions: [ 'ANY' ],
    fight: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        if (!args[0]) {
            //error
        } 

        if (!message.mentions || !message.mentions.members || !message.mentions.members?.first()) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID, message, 'Mention someone to start a fight with them');
        }

        let fighting: GuildMember = message.mentions.members.first()!;
        let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, fighting.user.id, message.author.id);
        let oppositeRelationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, message.author.id, fighting.user.id);

        let last_used: number = relationship.cooldowns.fight.last_used;
        let cooldown_time: number = relationship.cooldowns.fight.cooldown_time;

        let bestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild, message.author.id);
        let oppositeBestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild, fighting.user.id);

        if (Date.now() - last_used > cooldown_time) {

            const fight_msg = await message.channel.send(
                new MessageEmbed()
                .setColor(Bestfriends.embedColor)
                .setTitle(`${message.member?.displayName} has challenged ${fighting.displayName} to a fight`)
                .setDescription(`${fighting.displayName} must react with ✅ within 60 seconds to accept the challenge or ❎ to decline the challenge`)
                .setFooter(`${message.author.tag} vs. ${fighting.user.tag}`)
                .setTimestamp()
            )

            fight_msg.react('✅');
            fight_msg.react('❎');

            let fight_accepted: boolean = false; 
            let declined: boolean = false; 
            let fight_filter = (reaction: MessageReaction, user: User) => (reaction.emoji.toString() == '✅' || reaction.emoji.toString() == '❎') && user.id == fighting.user.id;
            const accept_collecter: ReactionCollector = fight_msg.createReactionCollector(fight_filter, { time: 60000 });

            accept_collecter.on('collect', (reaction: MessageReaction) => {
                if (reaction.emoji.toString() == '✅') {
                    fight_accepted = true;
                } else if (reaction.emoji.toString() == '❎') {
                    declined = true;
                }
                accept_collecter.stop();
            });

            accept_collecter.on('end', async (collected: Collection<string, MessageReaction>) => {
                if (fight_accepted) {
                    relationship!.cooldowns.fight.last_used = Date.now();
                    await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
                    message.channel.send(`${fighting.displayName} has accepted the challenge and they are preparing to fight!`).then(msg => msg.delete({ timeout: 2500 }));

                    relationship!.status -= 10;
                    oppositeRelationship!.status -= 10;

                    bestfriendsUser!.netStatus -= 10;
                    oppositeBestfriendsUser!.netStatus -= 10;

                    let challenger_hp: number = 100;
                    let challenger_hp_lost: number = 0;
                    let accepter_hp: number = 100;
                    let accepter_hp_lost: number = 0;

                    await sleep(2500);
                    let embed: MessageEmbed = new MessageEmbed()
                                              .setColor(Bestfriends.embedColor)
                                              .setDescription(`The fight has started! Ending in 30 seconds`)
                                              .addField(`${message.member!.displayName}'s HP`, `\`${challenger_hp}\``, true)
                                              .addField(`Round`, `1`, true)
                                              .addField(`${fighting!.displayName}'s HP`, `\`${accepter_hp}\``, true)
                    let scoreboard: Message = await message.channel.send(embed);

                    await sleep(7500, () => {
                        let outcome: number = Math.random() * 10;
                        let receiver: string = outcome > 5 ? message.member!.displayName : fighting.displayName;
                        let round_damage: number = Math.floor(Math.random() * 33);
                        receiver == message.member?.displayName ? challenger_hp_lost += round_damage : accepter_hp_lost  += round_damage;
                        outcome > 5 ? challenger_hp -= round_damage : accepter_hp -= round_damage;
                        //message.channel.send(`Round 1 has ended and ${receiver} took ${round_damage} damage`);
                        embed.fields = [];
                        embed.addField(`${message.member!.displayName}'s HP`, `\`${challenger_hp}\``, true)
                        embed.addField(`Round`, `2`, true)
                        embed.addField(`${fighting!.displayName}'s HP`, `\`${accepter_hp}\``, true)
                        scoreboard.edit(embed);
                    })

                    await sleep(7500, () => {
                        let outcome: number = Math.random() * 10;
                        let receiver: string = outcome > 5 ? message.member!.displayName : fighting.displayName;
                        let round_damage: number = Math.floor(Math.random() * 33);
                        receiver == message.member?.displayName ? challenger_hp_lost += round_damage : accepter_hp_lost  += round_damage;
                        outcome > 5 ? challenger_hp -= round_damage : accepter_hp -= round_damage;
                        //message.channel.send(`Round 2 has ended and ${receiver} took ${round_damage} damage`);
                        embed.fields = [];
                        embed.addField(`${message.member!.displayName}'s HP`, `\`${challenger_hp}\``, true)
                        embed.addField(`Round`, `3`, true)
                        embed.addField(`${fighting!.displayName}'s HP`, `\`${accepter_hp}\``, true)
                        scoreboard.edit(embed);
                    });

                    await sleep(7500, () => {
                        let outcome: number = Math.random() * 10;
                        let receiver: string = outcome > 5 ? message.member!.displayName : fighting.displayName;
                        let round_damage: number = Math.floor(Math.random() * 33);
                        receiver == message.member?.displayName ? challenger_hp_lost += round_damage : accepter_hp_lost  += round_damage;
                        outcome > 5 ? challenger_hp -= round_damage : accepter_hp -= round_damage;
                        //message.channel.send(`Round 3 has ended and ${receiver} took ${round_damage} damage. Match results will be determined in a few seconds!`);
                        embed.fields = [];
                        embed.addField(`${message.member!.displayName}'s HP`, `\`${challenger_hp}\``, true)
                        embed.addField(`Round`, `ENDING`, true)
                        embed.addField(`${fighting!.displayName}'s HP`, `\`${accepter_hp}\``, true)
                        scoreboard.edit(embed);
                    });

                    await sleep(5000, async () => {
                        let winner: string = challenger_hp > accepter_hp ? message.member!.displayName : fighting.displayName                        
                        let loser: string = challenger_hp < accepter_hp ? message.member!.displayName : fighting.displayName

                        if (winner == message.member!.displayName) {
                            addBuff(bestfriendsUser!, Buffs.VICTORIOUS, 25);
                            bestfriendsUser!.totalFights.won += 1;
                            bestfriendsUser!.totalFights.total += 1;
                            bestfriendsUser!.netStatus += 25;
                            
                        } else if (winner == fighting.displayName) {
                            addBuff(oppositeBestfriendsUser!, Buffs.VICTORIOUS, 25);
                            oppositeBestfriendsUser!.totalFights.won += 1;
                            oppositeBestfriendsUser!.totalFights.total += 1;
                            oppositeBestfriendsUser!.netStatus += 25;
                        }

                        if (loser == message.member!.displayName) {
                            addBuff(bestfriendsUser!, Buffs.HUMILIATED, -5);
                            bestfriendsUser!.totalFights.lost += 1;
                            bestfriendsUser!.totalFights.total += 1;
                            bestfriendsUser!.netStatus -= 5;

                        } else if (loser == fighting.displayName) {
                            addBuff(oppositeBestfriendsUser!, Buffs.HUMILIATED, -5);
                            oppositeBestfriendsUser!.totalFights.lost += 1;
                            oppositeBestfriendsUser!.totalFights.total += 1;
                            oppositeBestfriendsUser!.netStatus -= 5;
                        }

                        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
                        //message.channel.send(`The fight has ended and the winner is ${winner}`);
                        embed.setDescription(`The fight has ended and the winner is ${winner}`)
                        embed.fields = [];
                        embed.addField(`${message.member!.displayName}'s HP`, `\`${challenger_hp}\``, true)
                        embed.addField(`Round`, `ENDED`, true)
                        embed.addField(`${fighting!.displayName}'s HP`, `\`${accepter_hp}\``, true)
                        embed.setFooter(`${winner} is Victorious`)
                        scoreboard.edit(embed);
                    })
                } else {
                    declined ? message.channel.send(`${fighting.displayName} has declined the match!`) : message.channel.send(`${fighting.displayName} failed to accept the match in time`)
                }
            })
        } else {
            let cooldown = cooldown_time - (Date.now() - last_used);
            let long: boolean = true;
            return message.channel.send(`Please wait **${cooldown >= 86400000 ? ms(cooldown % 86400000, { long }) : ms(cooldown, { long })}** and **${cooldown_time >= 60000 ? ms(cooldown % 60000, { long }) : ms(cooldown % 1000, { long })}** before fighting this person again`);
        }
    }
}