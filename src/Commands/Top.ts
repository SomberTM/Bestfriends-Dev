import {
    Bestfriends,
    BestfriendsGuild,
    FLAGS,
    computePageRank,
    BestfriendsUser,
    Message, 
    Rank,
    MessageEmbed,
    helper,
    PageReaction,
    ARGUMENTS_NONE
} from '../deps';

export default {
    name: 'Top',
    aliases: [ 'top' ],
    description: `Gets the leaderboard for status or interactivity`,
    examples: [ 'top status', 'top interactivity', 'top --status', 'top --interactivity' ],
    permissions: [ "ANY" ],
    get: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        if (!args[0]) {
            let error: ARGUMENTS_NONE = {
                example: `${BestfriendsGuild.prefix}top activity\n${BestfriendsGuild.prefix}top status\n${BestfriendsGuild.prefix}top interactivity`,
                append_prefix: false,
                missing: [ `leaderboard to get` ]
            }
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.NONE, message, error);
        }

        BestfriendsGuild = await Bestfriends.database.get(message.guild!.id);

        let ARGS_FLAG: string = args[0].toLowerCase();
        //Also do Activity
        if(ARGS_FLAG == 'activity' || ARGS_FLAG == '--activity') {
            BestfriendsGuild.users.sort((a: BestfriendsUser, b: BestfriendsUser) => { return b.activity - a.activity });

            let Beautified: string[] = [];
            BestfriendsGuild.users.forEach((user: BestfriendsUser, index: number)=> {
                Beautified.push(`**${index+1}:** <@!${user.id}> \`(${user.activity})\``);
            });

            let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Most Popular in ${message.guild!.name} by Activity`);
            let msg = await message.channel.send(embed);
            if (BestfriendsGuild.users.length) {
                new PageReaction(msg, embed, Beautified, 10).setDescription('Ranked by number of messages sent\n');
            } else {
                new PageReaction(msg, embed, [ 'crickets 💤 - No Activity' ], 10);
            }

        } else if (ARGS_FLAG == 'status' || ARGS_FLAG == '--status') {
            BestfriendsGuild.users.sort((a: BestfriendsUser, b: BestfriendsUser) => { return b.netStatus - a.netStatus });

            let Beautified: string[] = [];
            BestfriendsGuild.users.forEach((user: BestfriendsUser, index: number)=> {
                Beautified.push(`**${index+1}:** <@!${user.id}> \`(${user.netStatus})\``);
            });

            let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Most Popular in ${message.guild!.name} by Total Status`);
            let msg = await message.channel.send(embed);
            if (BestfriendsGuild.users.length) {
                new PageReaction(msg, embed, Beautified, 10).setDescription('Ranked by the net status of all relationships between other users and this user\n');
            } else {
                new PageReaction(msg, embed, [ 'crickets 💤 - No Statuses' ], 10);
            }

        } else if (ARGS_FLAG == 'interactivity' || ARGS_FLAG == '--interactivity') {
            if (Date.now() - BestfriendsGuild.ranks.last_saved > BestfriendsGuild.ranks.save_interval) {
                await computePageRank(Bestfriends, BestfriendsGuild, message.guild!.id, FLAGS.INTERACTIVITY);
                BestfriendsGuild.ranks.last_saved = Date.now();
                await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
                Bestfriends.log(`Computed the page ranks for '${message.guild!.name.yellow}'`);
            }

            let Ranked: Rank[] = BestfriendsGuild.ranks.interactivity;

            let Beautified: string[] = [];
            Ranked.forEach((rank: Rank, index: number)=> {
                Beautified.push(`**${index+1}:** <@!${rank.id}> \`(${(rank.rank * 100).toFixed(2)}%)\``);
            });

            let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Most Popular in ${message.guild!.name} by Interactivity`)
            let msg: Message = await message.channel.send(embed);
            if (Ranked.length) {
                new PageReaction(msg, embed, Beautified, 10).setDescription('Ranked by how often a user is interacted with by other members (mentions/conversations)\n');
            } else {
                new PageReaction(msg, embed, [ 'crickets 💤 - No Interactions' ], 10);
            }

        } else {
            Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }
    }
}