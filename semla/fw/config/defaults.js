import { add, addDefault, envShortName } from './config'

export function applyDefaultConfig() {
    add('routes.defaults.csrfProtection', true)
    addDefault('cookies.active', true)
    addDefault('session.active', true)
    addDefault('session.store_db', false) // set to true to store sessions in DB (and to get the corresponding migration)
    if (envShortName() === 'dev') {
        addDefault('spas.start_dev', true)
    } else {
        addDefault('spas.start_dev', false)
    }

    addDefault('models.generate_description', false)

    addDefault('devtools.enabled', true)
    addDefault('fw.develop.devtools', false)

    addDefault('fw.requestlog.log_devrequests', false)

    addDefault('livereload.enabled', envShortName() === 'dev')

    addDefault('codegen.models', envShortName() == 'dev') // only true for TS projects somehow?

    addDefault('port', process.env.PORT || 8000)

    addDefault('semla.selftest_template_pathing', false)
}
