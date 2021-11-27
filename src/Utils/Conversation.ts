import { 
    activeUser, 
    Bestfriends,
    BestfriendsRelationship, 
    clone, 
    DefaultBestfriendsRelationship, 
    whitelistedChannel, 
    Message, 
    BestfriendsGuild 
} from '../deps';

export async function Conversation(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, message: Message) {
    if (!BestfriendsGuild!.whitelistedChannels.length) {

    } else {
        let thisChannel: whitelistedChannel | undefined = BestfriendsGuild!.whitelistedChannels.find((whitelistedChannel: whitelistedChannel) => whitelistedChannel.id == message.channel.id);
        if (thisChannel) {
            if (thisChannel.lastAuthor != message.author.id) {
                //We do stuff
                let activeAuthor: activeUser | undefined = thisChannel.activeUsers.find((user: activeUser) => user.id == message.author.id );
                let preActive: number = 0;
                
                if (activeAuthor) {
                    activeAuthor.sinceLast = -1;
                    preActive = activeAuthor.activeFor + 1;
                } else {
                    //Author was not already in active Users
                    thisChannel.activeUsers.push({
                        id: message.author.id,
                        activeFor: 0,
                        sinceLast: -1
                    });
                    preActive = 1;
                }

                thisChannel.activeUsers.forEach((user: activeUser) => {
                    user.activeFor++;
                    user.sinceLast++;

                    if (user.sinceLast >= BestfriendsGuild!.activeThreshold) {
                        thisChannel!.activeUsers.splice(thisChannel!.activeUsers.indexOf(user), 1);
                    } else if (preActive >= BestfriendsGuild!.activeMinimum && user.activeFor >= BestfriendsGuild!.activeMinimum && user.id != message.author.id) {
                        //Find and update Relationship Interactivity
                        let relationship: BestfriendsRelationship | undefined = BestfriendsGuild?.relationships.find((relationship: BestfriendsRelationship) => {
                            return relationship.to == user.id && relationship.from == activeAuthor!.id
                        });
                         
                        if (!relationship) {
                            let newRelationship: BestfriendsRelationship = clone(DefaultBestfriendsRelationship);

                            newRelationship.from = message.author.id;
                            newRelationship.to = user.id;
            
                            newRelationship.interactivity += 1;
    
                            Bestfriends.log(`${newRelationship.to.cyan} and ${newRelationship.from.cyan} increased their interactivity`)
                            BestfriendsGuild!.relationships.push(newRelationship);    
                        } else {
                            relationship.interactivity += 1;   
                            Bestfriends.log(`${relationship.to.cyan} and ${relationship.from.cyan} increased their interactivity`)
                        }
                    }
                })   
            }
            thisChannel.lastAuthor = message.author.id;
            await Bestfriends.database.set(message.guild!.id, BestfriendsGuild);
        }
        
    }
}