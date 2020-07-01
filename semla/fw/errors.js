export class DbError extends Error {
    constructor(message) {
        super(message)
        this.name = 'DbError'
        this.meta = {} // can have a "code" field.
        // code: 42P01 means undefined table
    }

    setMeta(meta) {
        this.meta = meta
    }
}
