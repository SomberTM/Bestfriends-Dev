import { Message } from 'discord.js';
import { 
    Bestfriends,
    BestfriendsGuild,
    CommandHandler,

    Client, 
    Guild,
    TextChannel,
    MessageEmbed,

    loadGuilds,
    createGuild, 
    deleteGuild,

    Emitter 
} from '../deps';

export function EventHandler(Bestfriends: Bestfriends) {
    const client: Client = Bestfriends.client;
    const BestfriendsClient: Emitter = Bestfriends.events;

    client.on('ready', async () => {
        await loadGuilds(Bestfriends);
        Bestfriends.log(`${client.user?.tag} has come online!`);
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

        let BestfriendsGuild: BestfriendsGuild = await Bestfriends.database.get(message.guild.id);
        
        //Send message about the current prefix
        if (message.content.toLowerCase().startsWith("prefix")) return;

        if (!message.content.startsWith(BestfriendsGuild.prefix)) {
            //Normal message stuff (non-command)
            return;
        }

        let args: string[] = message.content.slice(BestfriendsGuild.prefix.length).trim().split(/ +/g);
        let cmd: string = args.shift()!.toLowerCase();

        CommandHandler(Bestfriends, BestfriendsGuild, message, args, cmd);
    })

    /**
     * Add functionality
     */
    BestfriendsClient.on('commandUsed', (user: string, alias: string, description: string, log_channel: TextChannel) => {
        log_channel.send(
            new MessageEmbed()
        )
    })

}