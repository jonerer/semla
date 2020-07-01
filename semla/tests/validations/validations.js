import { ValidationCollector } from '../../fw/db/validation/collection'
import { ValidationRunner } from '../../fw/db/validation/validators'
import { MockDbAdapter } from '../../fw/db/adapters'
import {
    collectSetup,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models'

class Example {
    static setup(m) {
        m.validate(v => {
            v.present('name')
            v.present('onlyUpdate', {
                creation: false,
            })
            v.present('onlyCreation', {
                updating: false,
            })
        })
    }
}

test('Should collect the correct validations to run', () => {
    collectSetup(Example)
    const coll = Example._setup.validationCollector

    const updates = coll.getForMode('update')
    expect(updates.length).toBe(2)
    expect(updates[0].fields[0]).toBe('name')
    expect(updates[1].fields[0]).toBe('onlyUpdate')

    const creates = coll.getForMode('create')
    expect(creates.length).toBe(2)
    expect(creates[0].fields[0]).toBe('name')
    expect(creates[1].fields[0]).toBe('onlyCreation')
})

test('Should run presence validators', async () => {
    collectSetup(Example)
    const coll = Example._setup.validationCollector

    const ex = new Example()

    const runner = new ValidationRunner(ex, coll, 'update')

    const results = await runner.validate()
    expect(results.isValid()).toBe(false)
    expect(results.messages().length).toBe(2)

    ex.name = 'har_namn'

    const results2 = await runner.validate()
    expect(results2.isValid()).toBe(false)
    expect(results2.messages().length).toBe(1)

    ex.onlyUpdate = 'har_värde'

    const results3 = await runner.validate()
    expect(results3.isValid()).toBe(true)
})

test('Should not be able to save if unfulfilled', async () => {
    const mockAdapter = new MockDbAdapter()
    setDbAdapter(mockAdapter)

    mockAdapter.addModelTableMetadata('examples', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        { name: 'name', type: 'TEXT' },
        { name: 'onlyUpdate', type: 'TEXT' },
        { name: 'onlyCreation', type: 'TEXT' },
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
    ])

    registerModel(Example)

    await prepareModels()

    const unsavedInst = new Example()

    const valid = await unsavedInst.validate()
    expect(valid.isValid()).toBe(false)
    expect(valid.messages().length).toBe(2)

    unsavedInst.name = 'randomnamn'
    const valid2 = await unsavedInst.validate()
    expect(valid2.messages().length).toBe(1)

    unsavedInst.onlyCreation = 'onlycre'
    const valid3 = await unsavedInst.validate()
    expect(valid3.isValid()).toBe(true)
    expect(valid3.messages().length).toBe(0)

    unsavedInst.id = 555

    const valid4 = await unsavedInst.validate() // now we should be getting a fail on onlyUpdate
    expect(valid4.isValid()).toBe(false)
    expect(valid4.messages().length).toBe(1)
})

class IncorrectExample {
    static setup(m) {
        m.validate(v => {
            v.present('name', 'text', 'description')
        })
    }
}

test('Should warn on incorrect validator declaration', async () => {
    expect(() => {
        collectSetup(IncorrectExample)
    }).toThrow()
})
