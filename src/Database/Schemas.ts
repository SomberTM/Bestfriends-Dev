import { ms } from '../deps';

export interface BestfriendsGuild {
    prefix: string,
    relationships: BestfriendsRelationship[],
    users: BestfriendsUser[],
    whitelistedChannels: whitelistedChannel[], //For Active Converstation stuff
    randomEventsChannel: string,
    randomEvents: boolean,
    activeThreshold: number, //Active Conversation
    activeMinimum: number, //Active Conversation
    [key: string]: string | BestfriendsRelationship[] | BestfriendsUser[] | number | whitelistedChannel[] | boolean
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
    Shoutout: number,
    Callout: number,
    Fight: number,
    [key: string]: number
}

export const DefaultBestfriendsGuild: BestfriendsGuild = {
    prefix: 'bt.',
    activeThreshold: 3,
    activeMinimum: 3,
    randomEventsChannel: "", //Supplement random events channel
    randomEvents: false,
    relationships: [],
    users: [],
    whitelistedChannels: []
}

export const CooldownConstants: CDConsts = {
    Shoutout: ms('1 hour'),
    Callout: ms('1 hour'),
    Fight: ms('1 hour')
}

export const DefaultBestfriendsUser: BestfriendsUser = {
    id: "", //Supplement id
    activity: 1
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

export const MentionIncrement: number = 10;

