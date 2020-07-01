import { add, addDefault, envShortName } from './config'

export function applyDefaultConfig() {
    add('routes.defaults.csrfProtection', true)
    addDefault('session.active', true)
    addDefault('session.store_db', false) // set to true to store sessions in DB (and to get the corresponding migration)
    if (envShortName() === 'dev') {
        addDefault('spas.start_dev', true)
    } else {
        addDefault('spas.start_dev', false)
    }

    addDefault('devtools.enabled', true)
    addDefault('fw.develop.devtools', false)

    addDefault('fw.requestlog.log_devrequests', false)

    addDefault('livereload.enabled', envShortName() === 'dev')
}
