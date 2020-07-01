import { ControllerSetupCollector } from '../../fw/controllers/setup'

class ExampleController {
    beforeMe() {}
    beforeAll() {}
    beforeGetList() {}

    static setup(m) {
        m.before('me', this.beforeMe)
        m.before(this.beforeAll)
        m.before(['get', 'list'], this.beforeGetList)
    }
}

test('middlware collection', () => {
    const collector = new ControllerSetupCollector(ExampleController)
    ExampleController.setup.call(ExampleController.prototype, collector)

    const me = collector.getRelevantMiddleware('me')
    const get = collector.getRelevantMiddleware('get')
    const list = collector.getRelevantMiddleware('list')
    const unknown = collector.getRelevantMiddleware('unknown')

    expect(me.length).toBe(2)
    expect(me[0].callback).toBe(ExampleController.prototype.beforeMe)
    expect(me[1].callback).toBe(ExampleController.prototype.beforeAll)

    // ordering is maintained
    expect(get.length).toBe(2)
    expect(get[0].callback).toBe(ExampleController.prototype.beforeAll)
    expect(get[1].callback).toBe(ExampleController.prototype.beforeGetList)

    expect(list.length).toBe(2)
    expect(unknown.length).toBe(1)
    expect(unknown[0].callback).toBe(ExampleController.prototype.beforeAll)
})
