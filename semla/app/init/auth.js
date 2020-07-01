import { registerInitializer } from '../../fw/fw'

const initDb = i => {
    /*
    i.beforeRouter(ctx => {
        ctx.app.use((req, res, next) => {
            const isAuthed = req.query.isAuthed // just a mock thingy

            req.isAuthed = isAuthed

            next()
        })
    })
    */
}

registerInitializer(initDb)
