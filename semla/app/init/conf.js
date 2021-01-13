import { registerInitializer } from '../../fw/fw'

const initDb = i => {
    i.addSettings('session.key', 'random_session_key_for_tests')

    i.addSettings('fw.develop.devtools, true')

    // i.addSettings('session.store_db', true)
    // i.addSettings('session.active', false)
}

registerInitializer(initDb)
