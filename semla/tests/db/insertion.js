import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models'
import { MockDbAdapter } from '../../fw/db/adapters'
import { jsifyBody } from '../../fw/middlewares'

class Example {}

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

const makeMock = name => {
    mockAdapter.addModelTableMetadata(name, [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        { name: 'example_field', type: 'TEXT' },
        { name: 'example_other_field', type: 'TEXT' },
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
    ])
}

afterEach(() => {
    clearModels()
})

test('Inserting with all attributes', async () => {
    makeMock('examples')
    registerModel(Example)

    await prepareModels()

    const ex = new Example()
    ex.set({
        exampleField: 'ett',
        exampleOtherField: 'två',
    })

    const [insertSql, insertValues] = await ex.save({
        onlySql: true,
    })

    expect(insertSql).toBe(
        'insert into examples ("example_field", "example_other_field", "created_at") VALUES ($1, $2, $3) RETURNING *'
    )

    expect(insertValues[0]).toBe('ett')
    expect(insertValues[1]).toBe('två')
})

class Example2 {}
test('Inserting only some attributes', async () => {
    makeMock('example2s')
    registerModel(Example2)

    await prepareModels()

    const ex = new Example2()
    ex.set({
        exampleField: 'ett',
    })

    const [insertSql, insertValues] = await ex.save({
        onlySql: true,
    })

    expect(insertSql).toBe(
        'insert into example2s ("example_field", "created_at") VALUES ($1, $2) RETURNING *'
    )

    expect(insertValues[0]).toBe('ett')
})

// this is TODO!
test('Inserting a dollar sign', async () => {
    makeMock('example2s')
    registerModel(Example2)

    await prepareModels()

    const ex = new Example2()
    ex.set({
        exampleField: 'ett$dollartecken',
    })

    throw new Error('this is todo! the params need to be escaped somehow.')

    const [insertSql, insertValues] = await ex.save({
        onlySql: true,
    })

    expect(insertSql).toBe(
        'insert into example2s ("example_field", "created_at") VALUES ($1, $2) RETURNING *'
    )

    expect(insertValues[0]).toBe('ett')
})
