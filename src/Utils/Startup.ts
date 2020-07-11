import { 
    Bestfriends, 
    BestfriendsGuild, 
    DefaultBestfriendsGuild,
    Guild, 
    Collection 
} from '../deps';

export async function loadGuilds(Bestfriends: Bestfriends) {
    let guilds: Collection<string, Guild> = Bestfriends.client.guilds.cache;

    guilds.forEach(async (guild: Guild) => {
        try {
            let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
            //If the guild isnt in the database, add it
            if (!query) {
                await Bestfriends.database.set(guild.id, DefaultBestfriendsGuild);
                Bestfriends.log(`Added '${guild.name}' to the database`);
            } else {
                //If the default schema is updated this should resolve errors;
                if (Object.keys(query) != Object.keys(DefaultBestfriendsGuild)) {
                    let Missing_Keys: string[] = [];
                    let Extra_Keys: string[] = [];
                    
                    //Detects missing keys
                    for (let key of Object.keys(DefaultBestfriendsGuild)) {
                        if (!query[key]) {
                            query[key] = DefaultBestfriendsGuild[key];
                            Missing_Keys.push(key);
                        }
                    }

                    //Detects extra keys
                    for (let key of Object.keys(query)) {
                        if (!DefaultBestfriendsGuild[key]) {
                            delete query[key];
                            Extra_Keys.push(key);
                        }
                    }

                    await Bestfriends.database.set(guild.id, query);
                    if (Missing_Keys.length || Extra_Keys.length) {
                        Bestfriends.log(`'${guild.name}' was missing keys ${Missing_Keys.length ? Missing_Keys.map(key => `'${key}' `) : 'NONE'} and had extra keys ${Extra_Keys.length ? Extra_Keys.map(key => `'${key}' `) : 'NONE'}`);
                    }
                }
                Bestfriends.log(`'${guild.name}' already exists in the database`);
            }
        } catch (e) {
            throw e;
        }
    });
}

export async function createGuild(Bestfriends: Bestfriends, guild: Guild) {
    let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
    
    //Possibility to delete existing guild data if we are re-joining
    if (query) return;

    await Bestfriends.database.set(guild.id, DefaultBestfriendsGuild);
    Bestfriends.log(`Added '${guild.name}' to the database`);
}

export async function deleteGuild(Bestfriends: Bestfriends, guild: Guild) {
    let query: BestfriendsGuild | undefined = await Bestfriends.database.get(guild.id);
    
    //No data for this guild
    if (!query) return;

    await Bestfriends.database.delete(guild.id);
    Bestfriends.log(`Deleted '${guild.name}' from the database`);
}