import { 
    Bestfriends,
    BestfriendsGuild,
    DefaultBestfriendsGuild,
    BestfriendsRelationship,
    BestfriendsUser,
    MentionIncrement,
    CommandHandler,
    findRelationship,
    findUser,
    Conversation,

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
    PageReaction,
    sleep,
    ARGUMENTS_MISSING, 
    ARGUMENTS_NONE 
} from '../deps';
import {  } from '../Utils/PageReaction';

export function EventHandler(Bestfriends: Bestfriends) {
    const client: Client = Bestfriends.client;
    const BestfriendsClient: Emitter = Bestfriends.events;
    
    client.on('ready', async () => {
        await loadGuilds(Bestfriends);
        Bestfriends.log(`${client.user?.tag.red} has come online!`); 
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

        /*
        if (message.guild.id == '708922295644717156') {
            let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setTitle(`Hello Balls`);
            let msg = await message.channel.send(embed);
            new PageReaction(msg, embed, [ 'test', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7' ], 5).setDescription('Hello World Hehe!');
        }
        */

        //If the db was cleared this without repop this could be undefined so we need to check
        if (!BestfriendsGuild) {
            await Bestfriends.database.set(message.guild.id, DefaultBestfriendsGuild);
            BestfriendsGuild = await Bestfriends.database.get(message.guild.id)!;
            Bestfriends.log(`Added '${message.guild.name.yellow}' to the database`);
        }

        let BestfriendsUser: BestfriendsUser = findUser(BestfriendsGuild!, message.author.id);
        
        //Send message about the current prefix
        if (message.content.toLowerCase().startsWith("prefix")) return;

        //If not command
        if (!message.content.startsWith(BestfriendsGuild!.prefix)) {

            await Conversation(Bestfriends, BestfriendsGuild!, message);

            if (message.mentions.members || message.mentions.members!.first()) {
                let mentions: GuildMember[] = message.mentions.members!.array();
                mentions.forEach((member: GuildMember) => {
                    //Find the relationship between author and mentioned user
                    let relationship: BestfriendsRelationship = findRelationship(BestfriendsGuild!, member.user.id, message.author.id);

                    relationship.interactivity += MentionIncrement;
                    Bestfriends.log(`${relationship.to.cyan} and ${relationship.from.cyan} increased their interactivity`)                

                })
                await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
            }

            BestfriendsUser.activity += 1;
            await Bestfriends.database.set(message.guild.id, BestfriendsGuild);
            return Bestfriends.log(`${message.author.tag.cyan} increased their activity`);

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
            .setColor(Bestfriends.embedColor)
        )
    });

    BestfriendsClient.on(BestfriendsClient.RESPONSE, (message: Message, response: string) => {
        message.channel.send(response);
    });

    //Do stuff
    BestfriendsClient.on(BestfriendsClient.ARGUMENTS.NONE, async (message: Message, info: ARGUMENTS_NONE) => {
        let prefix: string = (<BestfriendsGuild>(await Bestfriends.database.get(message.guild!.id))).prefix;
        message.channel.send(
            new MessageEmbed()
            .setColor(Bestfriends.embedColor)
            .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
            .addField(`Error! Missing Arguments!`, info.missing.map((arg: string, index: number) => `Position ${index+1}: \`${arg}\``))
            .addField(`Example Usage`, `\`${info.append_prefix ? prefix + info.example : info.example}\``)
        )
    });

    //Do stuff
    BestfriendsClient.on(BestfriendsClient.ARGUMENTS.MISSING, (message: Message, info: ARGUMENTS_MISSING) => {

    });

    BestfriendsClient.on(BestfriendsClient.ARGUMENTS.INVALID, (message: Message, how: string) => {
        
    });

    BestfriendsClient.on(BestfriendsClient.PERMISSIONS.MISSING, (message: Message, ...args: any[]) => {
        message.channel.send(
            new MessageEmbed()
            .setColor(Bestfriends.embedColor)
            .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
            .setTitle(`Access Denied`)
            .addField(`Missing Permissions`, args.map((permission: string) => `• \`${permission}\``))
            .setTimestamp()
        )
    })

}