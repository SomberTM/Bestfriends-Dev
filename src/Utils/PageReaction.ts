import { 
    Bestfriends, 

    MessageReaction,
    Message, 
    MessageEmbed,
    EmojiIdentifierResolvable,
    User, 
    PartialUser
} from '../deps';

let bestfriends: Bestfriends;
let pageReactions: PageReaction[] = [];
const maxPageReactions: number = 100;

const upArrowEmoji: EmojiIdentifierResolvable = '🔼'.toString();
const downArrowEmoji: EmojiIdentifierResolvable = '🔽'.toString();

export class PageReaction {

    public readonly message: Message;
    public readonly embed: MessageEmbed;
    
    public bonuses: PageReactionBonuses = {};
    
    private contentPerPage: number;
    private pages: number;
    private formattedContents: string[][] = [];
    private currentPage: number = 1;
    private rawContents: string[];

    constructor(message: Message, embed: MessageEmbed, contents: string[], perPage: number) {
        this.message = message;
        this.embed = embed;
        this.rawContents = contents;
        this.contentPerPage = perPage;

        this.pages = Math.ceil(contents.length / perPage);
        this.format();
        this.update();
        this.message.react(upArrowEmoji);
        this.message.react(downArrowEmoji);

        bestfriends.events.emit(bestfriends.events.PAGEREACTION.CREATE, this);
    }

    /**
     * Set the old contents to something new
     */
    set contents(new_contents: string[]) {
        this.rawContents = new_contents;
        this.format();
        this.update();
    }

    get contents(): string[] {
        return this.rawContents;
    }

    set perPage(amount: number) {
        this.contentPerPage = amount;
        this.pages = Math.ceil(this.rawContents.length / amount);
        this.format();
        this.update();
    }

    /* Optionally async to be safe */
    public async addContent(content: string) {
        this.rawContents.push(content);
        this.format();
        await this.update();
        return this;
    }

    /* Optionally async to be safe */
    public async setTitle(title: string) {
        this.bonuses.title = title;
        await this.update();
        return this;
    }

    /* Optionally async to be safe */
    public async setDescription(desc: string) {
        this.bonuses.description = desc;
        await this.update();
        return this;
    }

    /* Optionally async to be safe */
    public async setFooter(footer: string) {
        this.bonuses.footer = footer;
        await this.update();
        return this;
    }

    /* Optionally async to be safe */
    public async setAuthor(name: string, iconURL?: string, url?: string) {
        this.bonuses.author = {
            name,
            iconURL,
            url
        }
        await this.update();
        return this;
    }

    public async goto(page: number) {
        this.currentPage = page;
        await this.update();
    }

    public reactionUpdate(reaction: MessageReaction) {
        if (this.message.id != reaction.message.id) return;
        switch (reaction.emoji.toString()) {

            case upArrowEmoji:
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.update();
                }
                break;

            case downArrowEmoji:
                if (this.currentPage < this.pages) {
                    this.currentPage++;
                    this.update();
                }
                break;

        }
    }

    private async update() {
        let footer: string = ``;
        let desc: string = ``;
        
        /* Only update if theres new information or we are setting info for the first time */

        /* No point in checking discrepencies with footer and description bc they will */
        /* always have differing info from the bonuses bc of page number and contents */
        if (this.bonuses.footer) footer += this.bonuses.footer; footer += `${this.currentPage}/${this.pages}`
        if (this.bonuses.description) desc += this.bonuses.description + '\n'; desc += this.formattedContents[this.indexablePage()].map(this.formatDescription).join('');
        if (this.bonuses.author && (this.bonuses.author.name != this.embed.author?.name || this.bonuses.author.iconURL != this.embed.author?.iconURL) ) this.embed.setAuthor(this.bonuses.author.name, this.bonuses.author.iconURL, this.bonuses.author.url);
        if (this.bonuses.title && this.bonuses.title != this.embed.title) this.embed.setTitle(this.bonuses.title);

        this.embed.setDescription(desc);
        this.embed.setFooter(footer);
        await this.message.edit(this.embed);
    }

    private indexablePage(): number {
        if (this.currentPage > 0 ) return this.currentPage-1;
        return 0;
    }

    private formatDescription(item: string) {
        return `${item}\n`;
    }

    private format() {
        let formatted: string[][] = [];
        for (let i = 0; i < this.pages; i++) { formatted.push([]); }
        let j: number = 1;
        for (let i = 0; i < this.rawContents.length; i++) {
            if ( i >= j * this.contentPerPage) {
                j++;
            }
            formatted[j-1].push(this.rawContents[i]);
        }
        this.formattedContents = formatted;
    }
}

export interface PageReactionBonuses {
    title?: string,
    description?: string,
    footer?: string,
    author?: {
        name?: string,
        iconURL?: string,
        url?: string
    },
}

export function startListeners(Bestfriends: Bestfriends) {
    bestfriends = Bestfriends;
    Bestfriends.events.on(Bestfriends.events.PAGEREACTION.CREATE, (reaction: PageReaction) => {
        pageReactions.length >= maxPageReactions ? pageReactions.splice(0, 1) : pageReactions.push(reaction);
    });

    Bestfriends.client.on('messageReactionAdd', (reaction: MessageReaction, user: PartialUser | User) => {
        if (user.bot) return;
        pageReactions.forEach((pr: PageReaction) => {
            pr.reactionUpdate(reaction);
        })
    });

    Bestfriends.client.on('messageReactionRemove', (reaction: MessageReaction, user: PartialUser | User) => {
        if (user.bot) return;
        pageReactions.forEach((pr: PageReaction) => {
            pr.reactionUpdate(reaction);
        })
    })
}