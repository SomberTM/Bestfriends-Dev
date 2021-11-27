import { 
    Bestfriends, 
    BestfriendsGuild, 
    DefaultBestfriendsGuild,
    Guild, 
    Collection ,
    _,
    clone,
    GuildChannel,
    TextChannel
} from '../deps';

export async function loadGuilds(Bestfriends: Bestfriends) {
    let guilds: Collection<string, Guild> = Bestfriends.client.guilds.cache;

    guilds.forEach(async (guild: Guild) => {
        try {
            await loadGuild(Bestfriends, guild);
        } catch (e) {
            throw e;
        }
    });
}

export async function loadGuild(Bestfriends: Bestfriends, guild: Guild) {
    let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
    //If the guild isnt in the database, add it
    if (!query) {
        let newGuild: BestfriendsGuild = clone(DefaultBestfriendsGuild);
        newGuild.id = guild.id;
        await Bestfriends.database.set(guild.id, newGuild);
        Bestfriends.log(`Added '${guild.name.yellow}' to the database`);
    } else {
        Bestfriends.log(`'${guild.name.yellow}' already exists in the database`);
        //If the default schema is updated this should resolve errors;
        if (!_.isEqual(Object.keys(query), Object.keys(DefaultBestfriendsGuild))) {
            let Missing_Keys: string[] = [];
            let Extra_Keys: string[] = [];
            
            //Detects missing keys
            for (let key of Object.keys(DefaultBestfriendsGuild)) {
                if (!query[key]) {
                    query[key] = DefaultBestfriendsGuild[key];
                    Missing_Keys.push(key);
                }
            }

            //Detects extra / leftover keys
            for (let key of Object.keys(query)) {
                if (!DefaultBestfriendsGuild[key]) {
                    delete query[key];
                    Extra_Keys.push(key);
                }
            }

            
            if (Missing_Keys.length || Extra_Keys.length) {
                Bestfriends.log(`'${guild.name.red}' was missing keys${Missing_Keys.length ? Missing_Keys.map(key => ` '${key}'`.red) : ' NONE'.gray} and had extra keys${Extra_Keys.length ? Extra_Keys.map(key => ` '${key}'`.red) : ' NONE'.gray}`);
            }
        }
        
        if (query.randomEvents.enabled && query.randomEvents.channel) {
            let eventsChannel: TextChannel = <TextChannel>guild.channels.cache.find((channel: GuildChannel) => channel.type == 'text' && channel.id == query?.randomEvents.channel)!;
            Bestfriends.log(`Starting events for '${guild.name.yellow}' in '#${eventsChannel.name.cyan}' on interval '${query.randomEvents.interval.toString().green}ms'`)
            Bestfriends.commands.get('EnableRandomEvents').start(Bestfriends, query, eventsChannel, []);
        }
        
        await Bestfriends.database.set(guild.id, query);
    }
}

export async function createGuild(Bestfriends: Bestfriends, guild: Guild) {
    let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
    
    //Possibility to delete existing guild data if we are re-joining
    if (query) return;

    await Bestfriends.database.set(guild.id, DefaultBestfriendsGuild);
    Bestfriends.log(`Added '${guild.name.green}' to the database`);
}

export async function deleteGuild(Bestfriends: Bestfriends, guild: Guild) {
    let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
    
    //No data for this guild
    if (!query) return;

    await Bestfriends.database.delete(guild.id);
    Bestfriends.log(`Deleted '${guild.name}' from the database`);
}
