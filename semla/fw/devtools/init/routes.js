import { registerRoutes } from '../../routes/routes'

const routes = r => {
    r.prefix(
        'api/dev',
        r => {
            r.get('home', 'devhome@home')

            r.get('models', 'devmodels@index')

            r.get('routes', 'devroutes@index')

            r.get('controllers', 'devcontrollers@index')

            r.post('fixerupper', 'devfixerupper@post')

            r.post('db/query', 'devdb@query')

            r.get('globals', 'devglobals@index')

            r.get('requests', 'devloggedrequests@index')
            r.post(
                'requests/:devloggedrequest/repeat',
                'devloggedrequests@repeat'
            )

            r.post('migrations', 'devmigrations@create')
            r.post('migrations/run', 'devmigrations@run')
            r.get('migrations', 'devmigrations@index')

            r.post('generate', 'devgeneration@create')
            r.post('generate/apply', 'devgeneration@apply')

            r.get('info', 'devinfo@index')
            r.get('loader', 'devloader@index')

            r.get('doc_page/:docPage', 'devdocs@docPage')

            r.get('config', 'devconfigs@index')
        },
        {
            session: false,
            csrfProtection: false,
            meta: {
                builtinDevRoute: true
            }
        }
    )
}

registerRoutes(routes)
