import {
    Bestfriends,
    loadGuilds
} from '../deps'

export async function ClearDatabase(Bestfriends: Bestfriends) {
    await Bestfriends.database.clear();
}

export async function ClearDatabaseAndRepopulate(Bestfriends: Bestfriends) {
    await ClearDatabase(Bestfriends);
    await loadGuilds(Bestfriends);
}