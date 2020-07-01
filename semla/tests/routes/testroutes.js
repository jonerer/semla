import {
    clearRoutes,
    generateRoutes,
    registerRoutes,
} from '../../fw/routes/routes'

function basicToplevel(r) {
    r.get('getter', 'home@get_action')
    r.post('postger', 'home@post_action')
    r.delete('deleter', 'home@delete_action')
}

test('Should do basic top level routes', () => {
    registerRoutes(basicToplevel)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(3)
    const g = gen[0]
    expect(g.method).toBe('get')
    expect(g.controllerName).toBe('home')
    expect(g.action).toBe('get_action')
})

function resourcesRoutes(r) {
    r.resources('cats')
}

test('Should do resources', () => {
    registerRoutes(resourcesRoutes)
    const gen = generateRoutes()
    clearRoutes()

    const index = gen[0]
    expect(index.action).toBe('index')
    expect(index.path).toBe('/cats')

    const update = gen[3]
    expect(update.action).toBe('update')
    expect(update.path).toBe('/cats/:cat')

    const create = gen[1]
    expect(create.action).toBe('create')
    expect(create.path).toBe('/cats')

    expect(gen.length).toBe(5)
})

function prefixedRoutes(r) {
    r.prefix('api', r => {
        r.get('apiroute', 'contr@apiroute_action')
    })
}

test('Should be able to generate my routeeees', () => {
    registerRoutes(prefixedRoutes)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(1)

    expect(gen[0].path).toBe('/api/apiroute')
})

function nestedResource(r) {
    r.resources('teams', r => {
        r.resources('items')
    })
}

test('should handle a nested resource', () => {
    registerRoutes(nestedResource)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(10)

    const itemsindex = gen[5]
    expect(itemsindex.path).toBe('/teams/:team/items')
    const itemsshow = gen[7]
    expect(itemsshow.path).toBe('/teams/:team/items/:item')
})

function semiNestedResources(r) {
    r.resources('teams', r => {
        r.semiNestedResources('items')
    })
}

test('should handle a seminested resources', () => {
    // todo: come up with a better name for this
    registerRoutes(semiNestedResources)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(10)

    const itemsindex = gen[5]
    expect(itemsindex.path).toBe('/teams/:team/items')
    const itemsshow = gen[7]
    expect(itemsshow.path).toBe('/items/:item')
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
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(10)

    const itemsindex = gen[5]
    expect(itemsindex.path).toBe('/api/teams/:team/items')
    const itemsshow = gen[7]
    expect(itemsshow.path).toBe('/api/items/:item')
})

function resourcesWithOptions(r) {
    r.prefix('api', r => {
        r.resources('teams', {
            controller: 'apiteams',
        })
    })
}

test('should handle a resources thing with custom controller', () => {
    registerRoutes(resourcesWithOptions)
    const gen = generateRoutes()
    clearRoutes()

    expect(gen.length).toBe(5)

    const itemsindex = gen[0]
    expect(itemsindex.controllerName).toBe('apiteams')
})
