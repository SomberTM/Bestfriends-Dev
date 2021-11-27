import { Guild } from 'discord.js';
import {
    Bestfriends,
    loadGuilds,
    loadGuild
} from '../deps'

export async function ClearDatabase(Bestfriends: Bestfriends) {
    await Bestfriends.database.clear();
}

export async function ClearGuild(Bestfriends: Bestfriends, guild_id: string) {
    await Bestfriends.database.delete(guild_id);
}

export async function ClearGuildAndRepopulate(Bestfriends: Bestfriends, guild: Guild) {
    await ClearGuild(Bestfriends, guild.id);
    await loadGuild(Bestfriends, guild);
}

export async function ClearDatabaseAndRepopulate(Bestfriends: Bestfriends) {
    await ClearDatabase(Bestfriends);
    await loadGuilds(Bestfriends);
}