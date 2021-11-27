import { 
    Bestfriends, 
    clone,
    BestfriendsGuild, 
    BestfriendsRelationship, 
    DefaultBestfriendsRelationship,
    BestfriendsUser,
    DefaultBestfriendsUser,
    User,
    Buff,
    Buffs, 
    colors
} from '../deps';

export function createRelationship(BestfriendsGuild: BestfriendsGuild, to: string, from: string): BestfriendsRelationship {
    let newRelationship: BestfriendsRelationship = clone(DefaultBestfriendsRelationship);
    newRelationship.to = to;
    newRelationship.from = from;
    BestfriendsGuild.relationships.push(newRelationship);
    Bestfriends.log(`Created relationship from ${from.cyan} to ${to.cyan}`);
    //Refind the relationship in the relationships array to maintain &refrence to db
    return BestfriendsGuild.relationships.find((relationship: BestfriendsRelationship) => relationship.to == newRelationship.to && relationship.from == newRelationship.from)!;
}

export function createUser(BestfriendsGuild: BestfriendsGuild, id: string | User): BestfriendsUser {
    let newUser: BestfriendsUser = clone(DefaultBestfriendsUser);
    if (typeof id == 'string') { newUser.id = id; } else { newUser.id = id.id; }
    BestfriendsGuild.users.push(newUser);
    Bestfriends.log(`Created new user ${typeof id == 'string' ? id.cyan : id.tag.cyan}`);
    let sid: string = typeof id == 'string' ? id : id.id;
    //Refind the user in the users array to maintain &refrence to db
    return BestfriendsGuild.users.find((user: BestfriendsUser) => user.id == sid)!;
}

/**
 * Tries to find an existing user, if that user doesnt exist they will be created
 * @param BestfriendsGuild 
 * @param id 
 */
export function findUser(BestfriendsGuild: BestfriendsGuild, id: string): BestfriendsUser {
    let found: BestfriendsUser | undefined = BestfriendsGuild.users.find((user: BestfriendsUser) => user.id == id);
    return !found ? createUser(BestfriendsGuild, id) : found;
}

/**
 * Tries to find an existing relationship, if that relationship doesnt exist it creates it
 * @param BestfriendsGuild 
 * @param id 
 */
export function findRelationship(BestfriendsGuild: BestfriendsGuild, to: string, from: string): BestfriendsRelationship {
    let found: BestfriendsRelationship | undefined = BestfriendsGuild.relationships.find((relation: BestfriendsRelationship) => relation.to == to && relation.from == from);
    return !found ? createRelationship(BestfriendsGuild, to, from) : found;
}

export function addBuff(user: BestfriendsUser, buffName: string, value: number) {
    let BuffNames: string[] = [];
    /* Validate given buff name */
    for (let value of Object.values(Buffs)) { BuffNames.push(value); }
    if (!BuffNames.includes(buffName)) { throw new Error(`${colors.red('Invalid')} buff name provided to addBuff function`).stack }

    let buff: Buff | undefined = user.buffs.find((buff: Buff) => buff.name == buffName);

    if (!buff) {
        user.buffs.push({
            name: buffName,
            value
        });
    } else {
        buff.value += value;
    }
}

export async function save(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, guild: string): Promise<BestfriendsGuild> {
    await Bestfriends.database.set(guild, BestfriendsGuild);
    return await Bestfriends.database.get(guild);
}
