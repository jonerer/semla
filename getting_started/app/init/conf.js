import { registerInitializer } from 'genast'

const initDb = i => {
    i.addSettings('session.key', process.env.SESSION_KEY)
    i.addSettings('session.store_db', false)
}

registerInitializer(initDb)
