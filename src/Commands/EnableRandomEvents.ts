import {
    Bestfriends,
    BestfriendsGuild,
    ms,
    Collection, 
    GuildMember, 
    MessageEmbed, 
    MessageReaction, 
    ReactionCollector, 
    TextChannel, 
    User,
    BestfriendsRelationship,
    BestfriendsUser, 
    PageReaction,
    findRelationship, 
    findUser
} from '../deps';

export default {
    name: 'EnableRandomEvents',
    aliases: [ 'enableevents', 'enable-events' ],
    description: 'Enables random events to pop up in the provided channel on a given or pre-defined timer',
    examples: [ 'enable-events', 'enable-events 10m' ],
    permissions: [ 'ADMINISTRATOR' ],
    start: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, channel: TextChannel, args: string[]) {
        let event_channel: string = BestfriendsGuild.randomEvents.channel;

        if (!event_channel.length || event_channel == "" || !event_channel.match(/([0-9])/)) {
            Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.MISSING);
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }

        if (args[0]) {
            BestfriendsGuild.randomEvents.interval = ms(args[0]);
        }
        let event_time: number = BestfriendsGuild.randomEvents.interval;
        
        BestfriendsGuild.randomEvents.enabled = true;
        await Bestfriends.database.set(channel.guild.id, BestfriendsGuild);
        
        Bestfriends.log(`Setting interval for '${channel.guild.name.yellow}' every '${event_time.toString().green}ms'`)
        const interval: NodeJS.Timeout = setInterval(async () => {
            BestfriendsGuild = await Bestfriends.database.get(channel.guild.id);
            if (!BestfriendsGuild.randomEvents.enabled) return clearInterval(interval);

            let guild_members: GuildMember[] = channel.guild!.members.cache.array();

            if (guild_members.length < 3) {
                channel.send("too few users in server, disabling random events");
                //Disable Random Events
                BestfriendsGuild.randomEvents.enabled = false;
                await Bestfriends.database.set(channel.guild!.id, BestfriendsGuild);  
                return clearInterval(interval);
            }

            let randomIndex: number = Math.floor(Math.random() * guild_members.length);
            let randomMember: GuildMember = guild_members[randomIndex];     

            while (randomMember.user.bot) { randomMember = guild_members[Math.floor(Math.random() * guild_members.length)]; }

            let random_events: string[] = [ 'rumor', 'conflict' ];
            let randomEventIndex: number = Math.floor(Math.random() * random_events.length);

            switch (random_events[0]) {

                case 'rumor':
                    const rumor_msg = await channel.send(
                        new MessageEmbed()
                        .setColor(Bestfriends.embedColor)
                        .setTitle(`RANDOM EVENT: RUMOR!`)
                        .setDescription(`
                            Rumor has it that ${randomMember.displayName} did a thing!\n
                            React to this message with a ✅ to spread the rumor and decrease status with ${randomMember.displayName}
                            OR
                            React to this message with a ❎ to denounce the rumor and increase status with ${randomMember.displayName}
                        `)
                        .setTimestamp()
                    )

                    rumor_msg.react('✅');
                    rumor_msg.react('❎');

                    const rumor_filter = (reaction: MessageReaction, user: User) => (reaction.emoji.toString() == '✅' || reaction.emoji.toString() == '❎') && user.id != randomMember.user.id;
                    const rumor_collector: ReactionCollector = rumor_msg.createReactionCollector(rumor_filter, { time: BestfriendsGuild.randomEvents.duration });

                    rumor_collector.on('end', async (collected: Collection<string, MessageReaction>) => {
                        collected.forEach(async (reaction: MessageReaction) => {
                            switch (reaction.emoji.toString()) {
                                case '✅':
                                    let rcheckReactedUsers: string[] = [];
                                    reaction.users.cache.forEach(async (user: User) => {
                                        if (!user.bot) {
                                            let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, randomMember.user.id, user.id);
                                            relationship.status -= 10;
                                            let bestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild, relationship.to);
                                            bestfriendsUser.netStatus -= 10;
                                            rcheckReactedUsers.push(`• \`${channel.guild.member(user)!.displayName} (${relationship.status})\``);
                                        }
                                    })
                                    if (rcheckReactedUsers.length) {
                                        let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Users who spread the rumor about ${randomMember.displayName}`);
                                        let cpr = await channel.send(embed);
                                        new PageReaction(cpr, embed, rcheckReactedUsers, 10);
                                    } else {
                                        channel.send("Nobody Spread The Rumor");
                                    }
                                    break;

                                case '❎':
                                    let rexReactedUsers: string[] = [];
                                    reaction.users.cache.forEach(async (user: User) => {
                                        if (!user.bot) {
                                            let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, randomMember.user.id, user.id);
                                            relationship.status += 10;
                                            let bestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild, relationship.to);
                                            bestfriendsUser.netStatus += 10;
                                            rexReactedUsers.push(`• \`${channel.guild.member(user)!.displayName} (${relationship.status})\``);
                                        }
                                    })
                                    
                                    if (rexReactedUsers.length) {
                                        let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Users who opposed the rumor about ${randomMember.displayName}`)
                                        let expr = await channel.send(embed);
                                        new PageReaction(expr, embed, rexReactedUsers, 10);
                                    } else {
                                        channel.send("Nobody Opposed The Rumor");
                                    }
                                    break;
                            }
                            await Bestfriends.database.set(channel.guild!.id, BestfriendsGuild);
                        });
                        
                    })                    
                    break;

                case 'conflict':
                    //Pick another random user
                    let secondRandomMember: GuildMember = guild_members[Math.floor(Math.random() * guild_members.length)];
                    while (secondRandomMember.user.bot && secondRandomMember.user.id != randomMember.user.id) { secondRandomMember = guild_members[Math.floor(Math.random() * guild_members.length)]; }
                    const conflict_msg = await channel.send(
                        new MessageEmbed()
                        .setColor(Bestfriends.embedColor)
                        .setTitle(`RANDOM EVENT: CONFLICT!`)
                        .setDescription(`
                        A conflict has arisen between ${randomMember.displayName} and ${secondRandomMember.displayName}!\n
                        React to this message with a ✅ to increase status with ${randomMember.displayName} and decrease status with ${secondRandomMember.displayName}
                        OR
                        React to this message with a ❎ to increase status with ${secondRandomMember.displayName} and decrease status with ${randomMember.displayName}
                        `)
                        .setTimestamp()
                    );

                    conflict_msg.react('✅');
                    conflict_msg.react('❎');

                    const conflict_filter = (reaction: MessageReaction, user: User) => (reaction.emoji.toString() == '✅' || reaction.emoji.toString() == '❎') && user.id != randomMember.user.id && user.id != secondRandomMember.id;
                    const conflict_collector = conflict_msg.createReactionCollector(conflict_filter, { time: BestfriendsGuild.randomEvents.duration } );

                    conflict_collector.on('end', (collected: Collection<string, MessageReaction>) => {
                        collected.forEach(async (reaction: MessageReaction) => {
                            switch (reaction.emoji.toString()) {
                                case '✅':
                                    let ccheckReactedUsers: string[] = [];
                                    reaction.users.cache.forEach((user: User) => {
                                        if (!user.bot) {                                 
                                            let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, randomMember.user.id, user.id);
                                            let bfUser: BestfriendsUser = findUser(BestfriendsGuild, relationship.to);
                                            bfUser.netStatus += 10;
                                            relationship.status += 10;
                                            let otherRelationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, secondRandomMember.user.id, user.id);
                                            let otherBfUser: BestfriendsUser = findUser(BestfriendsGuild, otherRelationship.to);
                                            otherBfUser.netStatus -= 10;
                                            otherRelationship.status -= 10;
                                            ccheckReactedUsers.push(`• \`${channel.guild.member(user)!.displayName} (${relationship.status}, ${otherRelationship.status})\``);
                                        }
                                    });
                                    
                                    if (ccheckReactedUsers.length) {
                                        let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Users who supported ${randomMember.displayName}`);
                                        let cpr = await channel.send(embed);
                                        new PageReaction(cpr, embed, ccheckReactedUsers, 10);
                                    } else {
                                        channel.send(`Nobody Supported ${randomMember.displayName}`);
                                    }
                                    break;

                                case '❎':
                                    let cexReactedUsers: string[] = [];
                                    reaction.users.cache.forEach((user: User) => {
                                        if (!user.bot) {
                                            let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, randomMember.user.id, user.id);
                                            let bfUser: BestfriendsUser = findUser(BestfriendsGuild, relationship.to);
                                            bfUser.netStatus -= 10;
                                            relationship.status -= 10;
                                            let otherRelationship: BestfriendsRelationship = findRelationship(BestfriendsGuild, secondRandomMember.user.id, user.id);
                                            let otherBfUser: BestfriendsUser = findUser(BestfriendsGuild, otherRelationship.to);
                                            otherBfUser.netStatus += 10;
                                            otherRelationship.status += 10;
                                            cexReactedUsers.push(`• \`${channel.guild.member(user)!.displayName} (${otherRelationship.status}, ${relationship.status})\``);

                                        }
                                    });
                                    
                                    if (cexReactedUsers.length) {
                                        let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Users who supported ${secondRandomMember.displayName}`)
                                        let xpr = await channel.send(embed);
                                        new PageReaction(xpr, embed, cexReactedUsers, 10);
                                    } else {
                                        channel.send(`Nobody Supported ${secondRandomMember.displayName}`);
                                    }
                                    break;
                            }
                            await Bestfriends.database.set(channel.guild.id, BestfriendsGuild);
                        });
                    })
                    
                    break;

            }

        }, event_time);
    }
}