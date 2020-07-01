import {
    clearRoutes,
    generateRoutes,
    registerRoutes,
} from '../../fw/routes/routes'

function prefixWithoutSession(r) {
    r.prefix(
        'cats',
        r => {
            r.get('wut', 'contr@weo')
        },
        {
            session: false,
        }
    )
}

function prefixStandard(r) {
    r.prefix('cats', r => {
        r.get('wut', 'contr@weo')
    })
}

test('Should be able to set session false to a prefix', () => {
    registerRoutes(prefixWithoutSession)
    const gen = generateRoutes()
    clearRoutes()

    const g = gen[0]
    expect(g.options.session).toBe(false)
    expect(g.useSession()).toBe(false)
})

test('Should throw if trying to register a route with an unknown option', () => {
    registerRoutes(function wrongOption(r) {
        r.get('/hej', 'hej@hej', {
            tjosan: false,
        })
    })
    // should ideally throw already on registerRoutes. But that's a bit harder to do
    expect(generateRoutes).toThrow()
    clearRoutes()
})

test('Should be able to get sessions by default', () => {
    registerRoutes(prefixStandard)
    const gen = generateRoutes()
    clearRoutes()

    const g = gen[0]
    expect(g.useSession()).toBe(true)
})

function cascadedRoutes(r) {
    r.prefix('api', r => {
        r.get('prot', 'us@ac2')
        r.get('unprot', 'us@ac', {
            csrfProtection: false,
        })
    })
}

test('Should be able deactivate csrf protection for a route', () => {
    registerRoutes(cascadedRoutes)
    const gen = generateRoutes()
    clearRoutes()

    const prot = gen[0]
    expect(prot.csrfProtected()).toBe(true)
    const unprot = gen[1]
    expect(unprot.csrfProtected()).toBe(false)
})

function parameterNameRoutes(r) {
    r.resources('team_invites', {
        parameterName: 'teaminvite',
    })
}

test('Should be able to specify parameter name for routes', () => {
    registerRoutes(parameterNameRoutes)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen[2].path).toBe('/team_invites/:teaminvite')
})
