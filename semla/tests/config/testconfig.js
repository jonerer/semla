import get, {
    add,
    getLeaves,
    fullConf,
    fullDefaults,
    setConf,
    setDefaults,
    allWithResolution,
} from '../../fw/config'

test('getting stuff', () => {
    const cfg = {
        db: {
            dev: {
                host: 'localhost',
            },
        },
    }

    add(cfg)

    const gotten = get('db.dev')

    expect(gotten.host).toBe('localhost')
    expect(get('db.dev.host')).toBe('localhost')

    add('route.hej.fniss', true)
    expect(get('route.hej.fniss')).toBe(true)
})

test('getting leaves', () => {
    const cfg = {
        db: {
            dev: {
                host: 'localhost',
                port: 555,
            },
        },
    }

    setConf(cfg)

    setDefaults({
        db: {
            dev: {
                port: 1337,
            },
        },
    })

    const confLeaves = getLeaves(fullConf())
    console.log(confLeaves)
    expect(confLeaves['db.dev.host']).toBe('localhost')
    expect(confLeaves['db.dev.port']).toBe(555)
    const defaultLeaves = getLeaves(fullDefaults())
    expect(defaultLeaves['db.dev.port']).toBe(1337)
})

test('getting resolved', () => {
    const cfg = {
        db: {
            dev: {
                host: 'localhost',
                port: 555,
            },
        },
    }

    setConf(cfg)

    setDefaults({
        db: {
            dev: {
                port: 1337,
                onlyInDefaults: true,
            },
        },
    })

    const res = allWithResolution()

    expect(res.resolved['db.dev.host']).toBe('localhost')
    expect(res.resolved['db.dev.onlyInDefaults']).toBe(true)
})
