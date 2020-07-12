import { 
    Bestfriends,
    BestfriendsGuild,
    DefaultBestfriendsGuild,
    BestfriendsRelationship,
    DefaultBestfriendsRelationship,
    BestfriendsUser,
    DefaultBestfriendsUser,
    MentionIncrement,
    CommandHandler,
    whitelistedChannel,
    activeUser,

    Client, 
    Guild,
    TextChannel,
    MessageEmbed,
    Message,
    GuildMember,

    loadGuilds,
    createGuild, 
    deleteGuild,

    Emitter, 
    ms,
    clone, 
    colors
} from '../deps';

export function EventHandler(Bestfriends: Bestfriends) {
    const client: Client = Bestfriends.client;
    const BestfriendsClient: Emitter = Bestfriends.events;

    client.on('ready', async () => {
        await loadGuilds(Bestfriends);
        Bestfriends.log(`${client.user?.tag.red} has come online!`);
        for (let [key, value] of Object.entries(Bestfriends.commands.getAllHelp()[0])) {
            Bestfriends.log(`${key}: ${value}`);
        }
    });

    client.on('guildCreate', async (guild: Guild) => {
        await createGuild(Bestfriends, guild);
    });

    client.on('guildDelete', async (guild: Guild) => {
        await deleteGuild(Bestfriends, guild);
    })

    client.on('message', async (message: Message) => {
        //Return if the message was sent by a bot or in a dm
        if (message.author.bot || !message.guild) return;

        let BestfriendsGuild: BestfriendsGuild | undefined = await Bestfriends.database.get(message.guild.id);

        //If the db was cleared this without repop this could be undefined so we need to check
        if (!BestfriendsGuild) {
            await Bestfriends.database.set(message.guild.id, DefaultBestfriendsGuild);
            BestfriendsGuild = await Bestfriends.database.get(message.guild.id)!;
            Bestfriends.log(`Added '${message.guild.name.yellow}' to the database`);
        }

        let BestfriendsUser: BestfriendsUser | undefined = BestfriendsGuild!.users.find((user: BestfriendsUser) => user.id == message.author.id);
        
        //Send message about the current prefix
        if (message.content.toLowerCase().startsWith("prefix")) return;

        //If not command
        if (!message.content.startsWith(BestfriendsGuild!.prefix)) {

            if (!BestfriendsGuild!.whitelistedChannels.length) {

            } else {
                let thisChannel: whitelistedChannel | undefined = BestfriendsGuild!.whitelistedChannels.find((whitelistedChannel: whitelistedChannel) => whitelistedChannel.id == message.channel.id);
                if (thisChannel) {
                    if (thisChannel.lastAuthor != message.author.id) {
                        //We do stuff
                        let activeAuthor: activeUser | undefined = thisChannel.activeUsers.find((user: activeUser) => user.id == message.author.id );
                        let preActive: number = 0;
                        
                        if (activeAuthor) {
                            activeAuthor.sinceLast = -1;
                            preActive = activeAuthor.activeFor + 1;
                        } else {
                            //Author was not already in active Users
                            thisChannel.activeUsers.push({
                                id: message.author.id,
                                activeFor: 0,
                                sinceLast: -1
                            });
                            preActive = 1;
                        }

                        thisChannel.activeUsers.forEach((user: activeUser) => {
                            user.activeFor++;
                            user.sinceLast++;

                            if (user.sinceLast >= BestfriendsGuild!.activeThreshold) {
                                thisChannel!.activeUsers.splice(thisChannel!.activeUsers.indexOf(user), 1);
                            } else if (preActive >= BestfriendsGuild!.activeMinimum && user.activeFor >= BestfriendsGuild!.activeMinimum && user.id != message.author.id) {
                                //Find and update Relationship Interactivity
                                let relationship: BestfriendsRelationship | undefined = BestfriendsGuild?.relationships.find((relationship: BestfriendsRelationship) => {
                                    return relationship.to == user.id && relationship.from == activeAuthor!.id
                                });
                                 
                                if (!relationship) {
                                    let newRelationship: BestfriendsRelationship = clone(DefaultBestfriendsRelationship);

                                    newRelationship.from = message.author.id;
                                    newRelationship.to = user.id;
                    
                                    newRelationship.interactivity += 1;
            
                                    Bestfriends.log(`${newRelationship.to.cyan} and ${newRelationship.from.cyan} increased their interactivity`)
                                    BestfriendsGuild!.relationships.push(newRelationship);    
                                } else {
                                    relationship.interactivity += 1;   
                                    Bestfriends.log(`${relationship.to.cyan} and ${relationship.from.cyan} increased their interactivity`)
                                }
                            }
                        })   
                    }
                    thisChannel.lastAuthor = message.author.id;
                    await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
                }
                
            }

            if (message.mentions.members || message.mentions.members!.first()) {
                let mentions: GuildMember[] = message.mentions.members!.array();
                mentions.forEach((member: GuildMember) => {
                    //Try to find relationship between author and mentioned user
                    let relationship: BestfriendsRelationship | undefined = BestfriendsGuild!.relationships.find((relation: BestfriendsRelationship) => {
                        return relation.to == member.user.id && relation.from == message.author.id;
                    });

                    if (!relationship) {
                        let newRelationship: BestfriendsRelationship = clone(DefaultBestfriendsRelationship);

                        newRelationship.from = message.author.id;
                        newRelationship.to = member.user.id;
        
                        newRelationship.interactivity += MentionIncrement;

                        Bestfriends.log(`${newRelationship.to.cyan} and ${newRelationship.from.cyan} increased their interactivity`)
                        BestfriendsGuild!.relationships.push(newRelationship);
                    } else {
                        relationship.interactivity += MentionIncrement;
                        Bestfriends.log(`${relationship.to.cyan} and ${relationship.from.cyan} increased their interactivity`)
                    }

                })
                await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
            }

            if (!BestfriendsUser) {
                //Clone default user data
                let newUser: BestfriendsUser = clone(DefaultBestfriendsUser);
                //Set the new users id
                newUser.id = message.author.id;
                //Add the user to the db
                BestfriendsGuild!.users.push(newUser);
                //Set stuff
                await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
                return Bestfriends.log(`Added ${message.author.tag.cyan} to ${message.guild.name.yellow}`);
            } else {
                BestfriendsUser.activity += 1;
                await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
                return Bestfriends.log(`${message.author.tag.cyan} increased their activity`);
            }

        }

        let args: string[] = message.content.slice(BestfriendsGuild!.prefix.length).trim().split(/ +/g);
        let cmd: string = args.shift()!.toLowerCase();

        await CommandHandler(Bestfriends, BestfriendsGuild!, message, args, cmd);
    })

    /**
     * Add functionality
     */
    BestfriendsClient.on(BestfriendsClient.COMMAND_USED, (user: string, alias: string, description: string, log_channel: TextChannel) => {
        log_channel.send(
            new MessageEmbed()
        )
    });

    BestfriendsClient.on(BestfriendsClient.RESPONSE, (message: Message, response: string) => {
        message.channel.send(response);
    });

    //Do stuff
    BestfriendsClient.on(BestfriendsClient.ARGUMENTS.NONE, (message: Message, example: string, ...args: any[]) => {
        message.channel.send(
            new MessageEmbed()
            .setColor(Bestfriends.embedColor)
            .setTitle(`Missing Arguments!`)
            .setDescription(args.map((arg: string, index: number) => `Argument ${index+1}: \`${arg}\``))
            .setFooter(`ex: ${example}`)
        )
    });

    //Do stuff
    BestfriendsClient.on(BestfriendsClient.ARGUMENTS.MISSING, () => {

    });

}