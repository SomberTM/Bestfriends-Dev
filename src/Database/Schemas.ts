export interface BestfriendsGuild {
    prefix: string
    users: BestfriendsUser[],
    [key: string]: string | BestfriendsUser[]
}

export interface BestfriendsUser {
    id: string,
    [key: string]: string
}

export const DefaultBestfriendsGuild: BestfriendsGuild = {
    prefix: 'bt.',
    users: [],
}