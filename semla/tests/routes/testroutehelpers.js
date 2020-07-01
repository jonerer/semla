import {
    clearRoutes,
    generateRoutes,
    registerRoutes,
} from '../../fw/routes/routes'

function basicToplevel(r) {
    r.get('getter', 'home@get_action')
    r.post('postger', 'home@post_action')
    r.delete('deleter', 'home@delete_action')
    r.get('', 'home@home')
}

test('Should do basic top level routes', () => {
    registerRoutes(basicToplevel)
    const routes = generateRoutes()
    clearRoutes()

    const gen = routes.map(x => x.pathHelper)

    expect(gen.length).toBe(4)
    const first = gen[0]
    expect(first.methodName).toBe('homeGetAction')

    const groot = gen[3]
    expect(groot.methodName).toBe('homeHome')
    expect(groot.path).toBe('/')
})

function resourcesRoutes(r) {
    r.resources('cats')
}

test('Should do resources', () => {
    registerRoutes(resourcesRoutes)
    const routes = generateRoutes()
    clearRoutes()

    const gen = routes.map(x => x.pathHelper)

    const index = gen[0]
    expect(index.methodName).toBe('catIndex')
    expect(index.numRequiredParams).toBe(0)
    const result = index.callback()
    expect(result).toBe('/cats')

    const update = gen[3]
    expect(update.methodName).toBe('catUpdate')
    expect(update.numRequiredParams).toBe(1)
    const result2 = update.callback(10)
    expect(result2).toBe('/cats/10')

    const result3 = update.callback({ id: 20 })
    expect(result3).toBe('/cats/20')

    expect(gen.length).toBe(5)
})

function prefixedSemiNestedResources(r) {
    r.prefix('api', r => {
        r.resources('teams', r => {
            r.semiNestedResources('items')
        })
    })
}

test('should handle a seminested resources', () => {
    // todo: come up with a better name for this than seminested
    registerRoutes(prefixedSemiNestedResources)
    const routes = generateRoutes()
    clearRoutes()

    const gen = routes.map(x => x.pathHelper)

    expect(gen.length).toBe(10)

    const itemsindex = gen[5]
    expect(itemsindex.methodName).toBe('apiTeamItemIndex')
    expect(itemsindex.numRequiredParams).toBe(1)
    const result = itemsindex.callback(10)
    expect(result).toBe('/api/teams/10/items')

    const itemsshow = gen[7]
    expect(itemsshow.methodName).toBe('apiItemShow')
    expect(itemsshow.numRequiredParams).toBe(1)
    expect(itemsshow.callback(15)).toBe('/api/items/15')
})

function renamedResource(r) {
    r.resources('users', {
        controller: 'apiusers',
    })
}

test('should do renamed resources', () => {
    registerRoutes(renamedResource)
    const routes = generateRoutes()
    clearRoutes()

    const gen = routes.map(x => x.pathHelper)
    expect(gen.length).toBe(5)
    expect(gen[0].methodName).toBe('userIndex')
})
