import { setAppImportDirs } from '../../fw/loader'
import { registerRoutes } from '../../fw/fw'

export function routes(r) {
    r.resources('users', r => {
        r.semiNestedResources('pets')
    })

    r.prefix(
        'api',
        r => {
            r.resources('users', {
                controller: 'apiusers',
            })
        },
        // { authenticator: 'jwt' }
    )

    r.prefix('auth', r => {
        r.get('login', 'auth@login')
        r.get('register', 'auth@register')

        r.post('dologin', 'auth@dologin')
        r.post('doregister', 'auth@doregister')
    })

    r.resources('cats')

    r.get('', 'home@home')
    r.get('templateTest', 'home@templateTester')

    r.post('setSession', 'sessiontester@set')
    r.get('getSession', 'sessiontester@get')

    r.post(
        '/paramstest/paramOne/:paramOne/paramTwo/:paramTwo',
        'paramstester@test'
    )
    r.prefix('api', r => {
        r.get('teams', 'teams@index')
        r.post('teams', 'teams@create')
    })

    r.get('test_auth', 'authtester@testAuth')

    r.get('/csrf', 'csrftester@show', {
        csrfProtection: true,
    })
    r.post('/csrf', 'csrftester@post', {
        csrfProtection: true,
    })
}

registerRoutes(routes)
