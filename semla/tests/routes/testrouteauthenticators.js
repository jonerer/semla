test('todo', () => {
    expect(true).toBeTruthy()
})

/*

TODO: Authenticators? Or leave that up to the user?
import {
    clearRoutes,
    generateRoutes,
    registerRoutes,
} from '../../fw/routes/routes'

function basicToplevel(r) {
    r.get('getter', 'home@getAction')

    r.get('getterAuth', 'home@getAuthedAction', {
        authenticator: 'jwt',
    })

    r.prefix(
        'api',
        r => {
            r.resources('users', r => {
                r.resources('cats')
            })
        },
        {
            authenticator: 'jwt_res',
        }
    )
}

test('Should be able to cascade authenticators', () => {
    registerRoutes(basicToplevel)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen[1].options.authenticator).toBe('jwt')
    expect(gen[2].options.authenticator).toBe('jwt_res')
    expect(gen[7].path.indexOf('cats')).not.toBe(-1)
    expect(gen[7].options.authenticator).toBe('jwt_res')
})
 */
