import {
    clearInitializers,
    collect,
    initialize,
    registerInitializer,
} from '../../fw/initialize/startup'
import { getRequestDiBuilder } from '../../fw/di/web_di'

class SingletonClass {}
class RequestClass {}

const initSettingsAddDi = i => {
    i.addDi(SingletonClass, {
        scope: 'single',
    })

    i.addDi(RequestClass, {
        scope: 'request',
    })
}

test('Should be able to add classes to our scopes, and they should show up in the web builder', () => {
    registerInitializer(initSettingsAddDi)

    const collector = collect()

    expect(collector.addedDiThings.length).toBe(2)

    initialize()
    const webDiBuilder = getRequestDiBuilder()

    expect(webDiBuilder.items.length).toBe(2)
})

afterEach(() => {
    clearInitializers()
})
