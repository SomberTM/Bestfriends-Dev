import { ms } from '../deps';

export interface BestfriendsGuild {
    id: string,
    prefix: string,
    relationships: BestfriendsRelationship[],
    users: BestfriendsUser[],
    whitelistedChannels: whitelistedChannel[], //For Active Converstation stuff
    ranks: Ranks,
    randomEvents: randomEvents,
    activeThreshold: number, //Active Conversation
    activeMinimum: number, //Active Conversation
    [key: string]: string | BestfriendsRelationship[] | BestfriendsUser[] | number | whitelistedChannel[] | randomEvents | Ranks
}

export interface Ranks {
    status: Rank[],   //Status
    activity: Rank[], //Messages
    interactivity: Rank[], //Mentions
    last_saved: number
    save_interval: number
    [key: string]: Rank[] | number
}

export interface Rank {
    id: string,
    rank: number
}

export interface randomEvents {
    channel: string,
    enabled: boolean,
    interval: number,
    duration: number
    [key: string]: string | boolean | number
}

export interface whitelistedChannel {
    id: string,
    activeUsers: activeUser[],
    lastAuthor: string,
    name: string
    [key: string]: string | activeUser[]
}

export interface activeUser {
    id: string,
    activeFor: number,
    sinceLast: number,
    [key: string]: string | number
}

export interface BestfriendsRelationship {
    to: string,
    from: string,
    interactivity: number,
    status: number,
    cooldowns: BestfriendsUserCooldowns
    [key: string]: string | number | BestfriendsUserCooldowns
}

export interface BestfriendsUser {
    id: string,
    activity: number
    netStatus: number //Equal to status of relationships to me + buffs
    buffs: Buff[],
    totalFights: {
        won: number,
        lost: number,
        total: number
    }
}

//Each User has a list of Buffs. Value affects Net Status of that User
export interface Buff {
    name: string,
    value: number
}

//Cooldowns for each user
export interface BestfriendsUserCooldowns {
    shoutout: Cooldown,
    callout: Cooldown,
    fight: Cooldown
    [key: string]: Cooldown
}   

//last_used will be Date.now() when set
//To calculate cooldown, when they call the command do Date.now() - last_used > cooldown_time
export interface Cooldown {
    last_used: number, //ms
    cooldown_time: number //ms,
    [key: string]: number
}

export interface CDConsts {
    Ranks: number,
    Shoutout: number,
    Callout: number,
    Fight: number,
    [key: string]: number
}

export const CooldownConstants: CDConsts = {
    Ranks: ms('1 hour'),
    Shoutout: ms('1 hour'),
    Callout: ms('1 hour'),
    Fight: ms('1 hour')
}

export const DefaultBestfriendsGuild: BestfriendsGuild = {
    id: "",
    prefix: 'bt.',
    activeThreshold: 3,
    activeMinimum: 3,
    randomEvents: {
        channel: "",
        enabled: false,
        interval: ms('15m'),
        duration: 60000
    },
    ranks: {
        status: [],
        activity: [],
        interactivity: [],
        last_saved: (Date.now() - CooldownConstants.Ranks),
        save_interval: CooldownConstants.Ranks
    },
    relationships: [],
    users: [],
    whitelistedChannels: []
}

export const DefaultBestfriendsUser: BestfriendsUser = {
    id: "", //Supplement id
    activity: 1,
    netStatus: 0,
    buffs: [],
    totalFights: {
        won: 0,
        lost: 0,
        total: 0
    }
}

export const DefaultBestfriendsRelationship: BestfriendsRelationship = {
    to: "", //Supplement id
    from: "",
    //Mentions & Conversations (How often others interact with you)
    interactivity: 0,
    //Events
    status: 0,
    cooldowns: {
        //Date.now() - last_used > cooldown_time means we are off cooldown
        //Subtract cd time from Date.now() at init so the command is immediately off cd
        shoutout: {
            last_used: (Date.now() - CooldownConstants.Shoutout),
            cooldown_time: CooldownConstants.Shoutout
        },
        callout: {
            last_used: (Date.now() - CooldownConstants.Callout),
            cooldown_time: CooldownConstants.Callout
        },
        fight: {
            last_used: (Date.now() - CooldownConstants.Fight),
            cooldown_time: CooldownConstants.Fight
        }
    }
}

export interface BuffConstants {
    VICTORIOUS: string,
    HUMILIATED: string
}

export const Buffs: BuffConstants = {
    VICTORIOUS: 'Victorious',   //Each Stack of this buff grants 30 Net Status
    HUMILIATED: 'Humiliated'    //Each Stack of this buff removes 5 Net Status
}

export const MentionIncrement: number = 10;

