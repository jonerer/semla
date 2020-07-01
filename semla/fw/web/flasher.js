export class Flasher {
    constructor(_session) {
        this.session = _session
    }

    flashes() {
        let allFlashes = []
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
        let allFlashes = []
        if (this.session.flashes) {
            allFlashes = [...this.session.flashes]
        }

        allFlashes.push([type, text])

        this.session.flashes = allFlashes
    }
}
