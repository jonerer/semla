import { registerModel } from '../../fw/fw'
import { MockDbAdapter } from '../../fw/db/adapters'
import { prepareModels, setDbAdapter } from '../../fw/db/models'

class BaseModel {}

class ExampleTwoFields extends BaseModel {
    static setup(m) {
        m.fillable(['one', 'two'])
    }
}

class ExampleNotFillable extends BaseModel {
    async setup(m) {}
}

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)
mockAdapter.setAllEmpty()

test('See if we can fill a model', async () => {
    registerModel(ExampleNotFillable)
    registerModel(ExampleTwoFields)

    await prepareModels()

    const e = new ExampleTwoFields()
    e.fill({
        one: 1,
        two: 2,
        three: 3,
    })

    expect(e.one).toBe(1)
    expect(e.two).toBe(2)
    expect(e.three).toBe(undefined)

    const nf = new ExampleNotFillable()
    nf.fill({
        one: 1,
        two: 2,
        three: 3,
    })

    expect(nf.one).toBe(undefined)
    expect(nf.two).toBe(undefined)
    expect(nf.three).toBe(undefined)
})
