import { Message } from 'discord.js';
import { BestfriendsGuild } from '../Database/Schemas';
import { Bestfriends } from '../deps';

export default {
    name: 'SetEventChannel',
    aliases: ['seteventchannel', 'set-event-channel'],
    description: `Set the event channel for random events to go to`,
    examples: [ 'seteventchannel #<channel>'],
    permissions: [ 'MANAGE_CHANNELS' ],
    set: async function(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
        if (!args[0]) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.MISSING);
        }

        if (!message.mentions.channels.first()) {
            return Bestfriends.events.emit(Bestfriends.events.ARGUMENTS.INVALID);
        }

        BestfriendsGuild.randomEvents.channel = message.mentions.channels.first()!.id;
        message.channel.send(`Set random events channel to ${message.mentions.channels.first()!.toString()}`)
        await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
    }
}