import { BestfriendsGuild } from '../Database/Schemas';
import {
    Bestfriends,
    Rank
} from '../deps';

//Define a class Edge with To USER ID, From USER ID, and EDGE WEIGHT
//Define a class Node with USER ID and TOTAL OUT WEIGHT

class Edge {
    toNode!: Node;
    fromNode!: Node;
    weight: number;
    
    constructor(to: string, from: string, weightval: number) {
        this.weight = weightval;
        edges.push(this);
        let fromflag = false;
        let toflag = false;

        for(let i = 0; i < nodes.length; i++) {
            if(nodes[i].userID == from) {
                nodes[i].totOutWeight += weightval;
                this.fromNode = nodes[i];
                fromflag = true;
            } else if(nodes[i].userID == to) {
                this.toNode = nodes[i];
                toflag = true;
            }
        }

        if(!fromflag) {
            //NO EXISTING NODE FOUND, make and add one to nodes
            this.fromNode = new Node(from, weightval);
            //console.log(`[INFO]: Adding new from node : ${from}`);
            nodes.push(this.fromNode);
        }

        if(!toflag) {
            //NO EXISTING NODE FOUND, make and add one to nodes
            this.toNode = new Node(to, 0);
            //console.log(`[INFO]: Adding new to node : ${to}`);
            nodes.push(this.toNode);
        }

    }

}

export class Node {
    userID: string;
    totOutWeight: number;

    currRank: number = 0.0;
    nextRank: number = 0.0;

    constructor(user: string, weight: number) {
        this.userID = user;
        this.totOutWeight = weight;
    }
    
    addEdge(e: Edge) {
        this.totOutWeight += e.weight;
    }
}

let edges: Edge[] = [];
let nodes: Node[] = [];

export async function saveRanks(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, guild: string, flag: number): Promise<boolean> {
    nodes.sort((a: Node, b: Node) => {
        return b.currRank - a.currRank;
    });

    let toSave: Rank[] = [];

    for (let i = 0; i < nodes.length; i++) {
        toSave.push({ id: nodes[i].userID, rank: nodes[i].currRank});
    }

    if (flag == FLAGS.INTERACTIVITY) {
        BestfriendsGuild.ranks.interactivity = toSave;
    } else if (flag == FLAGS.STATUS) {
        BestfriendsGuild.ranks.status = toSave;
    }

    await Bestfriends.database.set(guild, BestfriendsGuild);
    return true;
}

export function topRanked(BestfriendsGuild: BestfriendsGuild, flag: number): Rank[]
{
    if (flag == FLAGS.INTERACTIVITY) {
        return BestfriendsGuild.ranks.interactivity;
    } else if (flag == FLAGS.STATUS) {
        return BestfriendsGuild.ranks.status;
    } else {
        //Shouldn't end up here
        return [];
    }
}

export function getNodes(): Node[] { return nodes;}

export function scaleRanks() {
    let sum = 0;
    for(let i = 0; i < nodes.length; i++) {
        sum += nodes[i].currRank;
    }
    for(let i = 0; i < nodes.length; i++) {
        nodes[i].currRank /= sum;
    }
}

export function isConverged(threshold: number) : boolean {
    for(let i = 0; i < nodes.length; i++) {
        if(Math.abs(nodes[i].nextRank - nodes[i].currRank) > threshold) {
            return false;
        }
    }
    return true;
}

export async function formatDatabase(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, flag: number): Promise<boolean> {
    //Loop through Database mentions and call constructor for each mention. Each mention is a edge.
    //After the loop, the Nodes[] and Edges[] should be populated.

    edges = [];
    nodes = [];

    let lowest: number = 100000000000000;
    if(flag == FLAGS.STATUS) {
        //Need to normalize values so there are no negatives
        for(let i = 0; i < BestfriendsGuild.relationships.length; i++) {
            if(BestfriendsGuild.relationships[i].status < lowest) {
                lowest = BestfriendsGuild.relationships[i].status;
            }
        }

        if(lowest > 0) {
            //Normalize
            lowest = 0;
        } else {
            //Add 1 so our lowest value is always greater than 0
            lowest = Math.abs(lowest) + 1;
        }
    }

    for (let i = 0; i < BestfriendsGuild.relationships.length; i++)
    {
        if(flag == FLAGS.INTERACTIVITY) {
            //If no interaction in this relationship
            if (BestfriendsGuild.relationships[i].interactivity > 0) {
                new Edge(BestfriendsGuild.relationships[i].to, BestfriendsGuild.relationships[i].from, BestfriendsGuild.relationships[i].interactivity);
            }
        } else if (flag == FLAGS.STATUS) {
            new Edge(BestfriendsGuild.relationships[i].to, BestfriendsGuild.relationships[i].from, BestfriendsGuild.relationships[i].status + lowest);
        }
    }
    return true;
    
}

export const FLAGS = {
    INTERACTIVITY: 0,
    STATUS: 1
}

//flag is 0 or 1, 0 computes rank for Interactivity, 1 computes for Status
export async function computePageRank(Bestfriends: Bestfriends, BestfriendsGuild: BestfriendsGuild, guild_id: string, flag: number): Promise<void>
{
    await formatDatabase(Bestfriends, BestfriendsGuild, flag);

    let threshold: number = 0.0001;
    let damping: number = 0.85;

    let convergence = false;
    let num_nodes = 0;
    let num_edges = 0;
    
    //Initialize
    num_nodes = nodes.length;
    num_edges = edges.length;

    for(let i = 0; i < num_nodes; i++) {
        nodes[i].currRank = 1.0/num_nodes;
    }

    do {
        //RESET next labels
        for(let j = 0; j < num_nodes; j++) {
            nodes[j].nextRank = (1.0 - damping)/num_nodes;
        }
        for(let j = 0; j < num_edges; j++) {
            let my_contribution = (damping * edges[j].fromNode.currRank * edges[j].weight)/edges[j].fromNode.totOutWeight;
            edges[j].toNode.nextRank += my_contribution;
        }
        convergence = isConverged(threshold);

        //Update curr ranks
        for(let j = 0; j < num_nodes; j++) {
            nodes[j].currRank = nodes[j].nextRank;
        }
    } while (!convergence);
    //SCALE IT then done
    scaleRanks();
    //if (flag == FLAGS.STATUS) console.log(nodes);
    await saveRanks(Bestfriends, BestfriendsGuild, guild_id, flag);
}
