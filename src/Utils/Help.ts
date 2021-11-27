import { 
    Bestfriends,  
    Helper,
    BestfriendsGuild,
    Message,
    MessageEmbed,
    PermissionResolvable
} from '../deps';

export function Help(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message, args: string[]) {
    let Helpers: Helper[] = Bestfriends.commands.getAllHelp();
    let CommandNames: string[] = Helpers.map((helper: Helper) => helper.name.toLowerCase());

    let embed: MessageEmbed = new MessageEmbed().setColor(Bestfriends.embedColor).setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL);

    if (!args[0]) {
        embed.setTitle(`All commands for Bestfriends Bot! Prefix: ${BestfriendsGuild.prefix}`)
        embed.setDescription(Helpers.map((helper: Helper) => {
            return `**${helper.name}**\n${helper.description}\n`
        }));
    } else if (args[0]) {
        //If we cant find a command by that name just return
        if (!CommandNames.find((name: string) => name == args[0].toLowerCase())) return;

        let commandData: Helper = Helpers.find((helper: Helper) => helper.name.toLowerCase() == args[0].toLowerCase())!;
        embed.setTitle(`Help for ${commandData.name} command`)
        embed.addField(`Description`, commandData.description)
        embed.addField(`Aliases`, `${commandData.aliases.map((ali: string) => `\`${ali}\``).join(', ')}`)
        embed.addField(`Examples`, `${commandData.examples.map((ex: string) => `${BestfriendsGuild.prefix}${ex}`).join(' | ')}`)
        embed.addField(`Permissions`, `${commandData.permissions.length ? commandData.permissions.map((perm: PermissionResolvable) => `\`${perm.toString()}\``).join(', ') : 'ANY'}`)
    }

    message.channel.send(embed);
}