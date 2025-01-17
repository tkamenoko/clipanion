export type ErrorMeta = {
    type: `none`;
} | {
    type: `usage`;
};

export class UsageError extends Error {
    public clipanion: ErrorMeta = {type: `usage`};

    constructor(message: string) {
        super(message);
        this.name = `UsageError`;
    }
}

export class UnknownSyntaxError extends Error {
    public clipanion: ErrorMeta = {type: `none`};

    constructor(public readonly input: string[], public readonly candidates: {usage: string, reason: string | null}[]) {
        super();
        this.name = `UnknownSyntaxError`;

        if (this.candidates.length === 0) {
            this.message = `Command not found, but we're not sure what's the alternative.`;
        } else if (this.candidates.length === 1 && this.candidates[0].reason !== null) {
            const [{usage, reason}] = this.candidates;
            this.message = `${reason}\n\n$ ${usage}`;
        } else if (this.candidates.length === 1) {
            const [{usage}] = this.candidates;
            this.message = `Command not found; did you mean:\n\n$ ${usage}\n${whileRunning(input)}`;
        } else {
            this.message = `Command not found; did you mean one of:\n\n${this.candidates.map(({usage}, index) => {
                return `${`${index}.`.padStart(4)} ${usage}`;
            }).join(`\n`)}\n\n${whileRunning(input)}`;
        }
    }
}

export class AmbiguousSyntaxError extends Error {
    public clipanion: ErrorMeta = {type: `none`};

    constructor(public readonly input: string[], public readonly usages: string[]) {
        super();
        this.name = `AmbiguousSyntaxError`;

        this.message = `Cannot find who to pick amongst the following alternatives:\n\n${this.usages.map((usage, index) => {
            return `${`${index}.`.padStart(4)} ${usage}`;
        }).join(`\n`)}\n\n${whileRunning(input)}`;
    }
}

const whileRunning = (input: string[]) => `While running ${input.map(token => {
    const json = JSON.stringify(token);
    if (token.match(/\s/) || token.length === 0 || json !== `"${token}"`) {
        return json;
    } else {
        return token;
    }
}).join(` `)}`;
