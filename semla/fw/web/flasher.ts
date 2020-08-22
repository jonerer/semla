interface Flash {
    type: string,
    text: string
}

interface Session { // because @types/express-session doesn't export it in a reasonable way...
    flashes: Flash[]
}

export class Flasher {
    private session: Session
    constructor(_session) {
        this.session = _session
    }

    flashes() {
        let allFlashes : Flash[] = []
        if (this.session.flashes) {
            allFlashes = [...this.session.flashes]
        }
        this.session.flashes = []
        return allFlashes.map(it => {
            return {
                type: it[0],
                text: it[1],
            }
        })
    }

    flash(type, text) {
        if (!text) {
            // if no type is supplied, 'info' is default
            text = type
            type = 'info'
        }
        let allFlashes: Flash[] = []
        if (this.session.flashes) {
            allFlashes = [...this.session.flashes]
        }

        allFlashes.push({type, text})

        this.session.flashes = allFlashes
    }
}
