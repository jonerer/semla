import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models.js'
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
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
    ])
}

afterEach(() => {
    clearModels()
})

test('Get fields from db', async () => {
    makeMock('examples')
    registerModel(Example)

    await prepareModels()

    expect(Example._modelName).toBe('Example')
    expect(Example._tableName).toBe('examples')
    expect(Example._fields.dbFieldNames()).toStrictEqual([
        'id',
        'example_field',
        'created_at',
    ])
    expect(Example._fields.jsFieldNames()).toStrictEqual([
        'id',
        'exampleField',
        'createdAt',
    ])
})

class Example2 {}

test('Should mark changed attributes as dirty', async () => {
    makeMock('example2s')
    registerModel(Example2)
    await prepareModels()
    const inst = new Example2()
    // have to access a field to instantiate _attributes and _dirty
    const _ = inst.id
    expect(Object.keys(inst._attributes)).toStrictEqual([])
    expect(Object.keys(inst._dirtyKeys)).toStrictEqual([])
    inst.id = 5

    expect(Object.keys(inst._dirtyKeys)).toHaveLength(1)
})

class ExampleOwner {}

class Example3 {
    static setup(m) {
        m.belongsTo('exampleOwner')
    }
}

test('Should mark changed attributes as dirty for belongsTo relations', async () => {
    registerModel(ExampleOwner)
    registerModel(Example3)

    makeMock('example_owners')
    mockAdapter.addModelTableMetadata('example3s', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        { name: 'example_owner_id', type: 'INTEGER' },
        { name: 'example_field', type: 'TEXT' },
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
    ])

    await prepareModels()
    const inst = new Example3()
    // have to access a field to instantiate _attributes and _dirty
    const _ = inst.id
    expect(Object.keys(inst._attributes)).toStrictEqual([])
    expect(Object.keys(inst._dirtyKeys)).toStrictEqual([])

    const theOwner = new ExampleOwner()
    theOwner.id = 2

    inst.exampleOwner = theOwner

    expect(Object.keys(inst._dirtyKeys)).toHaveLength(2)
    expect(inst._dirtyKeys.exampleOwner).toBe(true)
    expect(inst._dirtyKeys.exampleOwnerId).toBe(true)

    // let's see if it can generate good insertion sql
    const [sql, _values] = await inst.save({
        onlySql: true,
    })

    expect(sql).toBe(
        'insert into example3s ("example_owner_id", "created_at") VALUES ($1, $2) RETURNING *'
    )

    // let's see if it can generate good updating sql

    inst.id = 5

    const [updateSql, updateValues] = await inst.save({
        onlySql: true,
    })

    expect(updateSql).toBe(
        'update example3s set "example_owner_id" = $1, "id" = $2 where "id" = $3'
    )
})
