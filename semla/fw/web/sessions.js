import { isNonProd } from '../appinfo'
import expSess from 'express-session'
import get from '../config/config'
import {
    register,
    getDbStore,
    hasSessionsTable,
} from '../db/sessions/db_session'

let sessMiddleware = null

export const addSessionToRoute = (app, route) => {
    // route is a "GeneratedRoute" object. app is express
    app.use(route.path, sessMiddleware)
}

export const load = () => {
    const useDbStore = get('session.store_db')
    if (useDbStore) {
        register()
    }
}

export const initSessionManagement = async app => {
    if (get('session.active')) {
        const useDbStore = get('session.store_db')
        const hasTableInstalled = await hasSessionsTable()

        let store = undefined
        if (useDbStore && hasTableInstalled) {
            store = getDbStore(expSess)
        }

        // give the user the option to turn sessions off altogether
        let secret = get('session.key')
        if (!secret) {
            throw new Error(
                "You're using sessions, but haven't set a session.key."
            )
        }
        sessMiddleware = expSess({
            cookie: {
                secure: !isNonProd(),
                maxAge: 4 * 7 * 24 * 3600 * 1000, // four months
                httpOnly: true,
            },
            secret,
            resave: true,
            saveUninitialized: true,
            store,
        })
        if (!isNonProd()) {
            app.set('trust proxy', 1) // todo: is this good to use as a default?
        }
    } else {
        return
    }
}
