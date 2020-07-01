import {
    clearInitializers,
    collect,
    mergeSettings,
    registerInitializer,
} from '../../fw/initialize/startup'

const initSettingsThing = i => {
    i.addSettings('hej', 'san')
}

const initSettingsTwo = i => {
    i.addSettings('hej2', 'san2')
    i.addSettings('hej3', 'san3')
}

const initSettingsThree = i => {
    i.addSettings('database', {
        dev: {
            host: 'localhost',
        },
    })

    i.addSettings('database.dev', {
        host: 'inte localhost',
    })

    i.addSettings('fw.devtools.develop', true)
}

test('Initializer settings collection', () => {
    registerInitializer(initSettingsThing)
    registerInitializer(initSettingsTwo)

    const collector = collect()

    expect(collector.settings.length).toBe(3)

    clearInitializers()
})

test('Initializer settings merging', () => {
    registerInitializer(initSettingsThree)

    const coll = collect()
    const merged = mergeSettings(coll)

    expect(merged.database.dev.host).toBe('inte localhost')

    clearInitializers()
})
