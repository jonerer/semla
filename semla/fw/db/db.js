import pg from 'pg'
import get, { envShortName } from '../config/config'
import { DbError } from '../errors'

const Pool = pg.Pool

let pools = {} // one pool per env

export function getPool(env) {
    env = env || envShortName()
    let pool = pools[env]

    if (!pool) {
        const conf = get('database.' + env, {})

        const connConf = {
            host: conf.host,
            user: conf.user,
            password: conf.password,
            database: conf.database,
            port: conf.port,
        }

        pool = new Pool(connConf)
        pools[env] = pool
    }
    return pool
}

export async function query(text, params, env) {
    env = env || envShortName()
    params = params
    const pool = getPool(env)

    const prestack = new Error().stack
    let res = null
    try {
        res = await pool.query(text, params)
    } catch (e) {
        const err = new DbError(
            'Error in query. Query was "' +
                text +
                '" params were ' +
                JSON.stringify(params, null, 2) +
                '. Error from pg was "' +
                e.message +
                '". Stack before was: \n' +
                prestack
        )
        err.setMeta({
            code: e.code,
        })
        throw err
    }
    return res
}

export async function close() {
    for (const pool of Object.values(pools)) {
        await pool.end()
    }
}
