import { addMigrationFileDir } from '../migrations/migration'
import { getPool, query } from '../db'
import PgSession from 'connect-pg-simple'

export const register = () => {
    addMigrationFileDir(__dirname + '/migrations')
}

// match with what's in the sessions/migrations file
const tableName = 'sessions'

export const getDbStore = expSess => {
    const pgSession = PgSession(expSess)

    const store = new pgSession({
        // https://www.npmjs.com/package/connect-pg-simple
        pool: getPool(),
        tableName,
    })
    return store
}

export const hasSessionsTable = async () => {
    try {
        await query('select * from sessions')
        return true
    } catch (e) {
        return false
    }
}
